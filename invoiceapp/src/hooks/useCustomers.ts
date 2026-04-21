import { useState, useEffect, useCallback } from "react";
import type { Customer, CreateCustomerPayload, Invoice } from "../types";
import { customerService, invoiceService } from "../services/api";
import { mockCustomers } from "../services/mockData";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

const DEMO_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === "true";

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function normalizeCustomer(customer: Customer): Customer {
  const raw = customer as Customer & {
    invoice_count?: unknown;
    total_billed?: unknown;
    created_at?: unknown;
  };

  return {
    ...customer,
    invoiceCount: toNumber(customer.invoiceCount ?? raw.invoice_count),
    totalBilled: toNumber(customer.totalBilled ?? raw.total_billed),
    createdAt:
      customer.createdAt ??
      (typeof raw.created_at === "string" ? raw.created_at : undefined),
  };
}

function buildCustomerStats(invoices: Invoice[]) {
  const stats = new Map<number, { count: number; total: number }>();

  for (const invoice of invoices) {
    const rawInvoice = invoice as Invoice & {
      customerId?: unknown;
      customerID?: unknown;
    };

    const customerId = toNumber(
      invoice.customer_id ?? rawInvoice.customerId ?? rawInvoice.customerID,
    );
    if (!customerId) continue;

    const total = toNumber(invoice.total) ?? 0;
    const current = stats.get(customerId) ?? { count: 0, total: 0 };
    stats.set(customerId, {
      count: current.count + 1,
      total: current.total + total,
    });
  }

  return stats;
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: notify } = useNotification();
  const { user } = useAuth();

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 600));
        setCustomers(mockCustomers);
      } else {
        const [customerData, invoiceData] = await Promise.all([
          customerService.getAll(),
          invoiceService.getAll(),
        ]);

        const statsByCustomerId = buildCustomerStats(invoiceData);

        setCustomers(
          customerData.map((customer) => {
            const normalized = normalizeCustomer(customer);
            const stats = statsByCustomerId.get(normalized.id);

            return {
              ...normalized,
              invoiceCount: stats?.count ?? normalized.invoiceCount ?? 0,
              totalBilled: stats?.total ?? normalized.totalBilled ?? 0,
            };
          }),
        );
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load customers";
      setError(message);
      notify("Failed to load customers", message);
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    if (!user) {
      setCustomers([]);
      setError(null);
      return;
    }
    fetchCustomers();
  }, [fetchCustomers, user?.id, user]);

  const createCustomer = useCallback(
    async (payload: CreateCustomerPayload): Promise<Customer | null> => {
      try {
        if (DEMO_MODE) {
          await new Promise((r) => setTimeout(r, 600));
          const newCustomer: Customer = {
            id: Date.now(),
            ...payload,
            invoiceCount: 0,
            totalBilled: 0,
            createdAt: new Date().toISOString(),
          };
          setCustomers((prev) => [...prev, newCustomer]);
          success("Customer added", `${payload.name} has been created.`);
          return newCustomer;
        } else {
          const customer = normalizeCustomer(
            await customerService.create(payload),
          );
          setCustomers((prev) => [...prev, customer]);
          success("Customer added", `${payload.name} has been created.`);
          return customer;
        }
      } catch (e) {
        notify(
          "Failed to create customer",
          e instanceof Error ? e.message : undefined,
        );
        return null;
      }
    },
    [success, notify],
  );

  const deleteCustomer = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        const targetCustomer = customers.find((c) => c.id === id);
        const relatedInvoices = targetCustomer?.invoiceCount ?? 0;

        if (relatedInvoices > 0) {
          notify(
            "Cannot delete customer",
            "Delete the customer's invoices before deleting this customer",
          );
          return false;
        }

        if (DEMO_MODE) {
          await new Promise((r) => setTimeout(r, 400));
          setCustomers((prev) => prev.filter((c) => c.id !== id));
          success("Customer removed");
          return true;
        } else {
          const message = await customerService.delete(id);
          setCustomers((prev) => prev.filter((c) => c.id !== id));
          success("Customer removed", message);
          return true;
        }
      } catch (e) {
        notify(
          "Failed to delete customer",
          e instanceof Error ? e.message : undefined,
        );
        return false;
      }
    },
    [customers, success, notify],
  );

  return {
    customers,
    isLoading,
    error,
    fetchCustomers,
    createCustomer,
    deleteCustomer,
  };
}
