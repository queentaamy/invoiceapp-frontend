import { useState, useEffect, useCallback } from "react";
import type {
  Invoice,
  CreateInvoicePayload,
  UpdateInvoicePayload,
} from "../types";
import { invoiceService } from "../services/api";
import { mockInvoices } from "../services/mockData";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

const DEMO_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === "true";

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { success, error: notify } = useNotification();
  const { user } = useAuth();

  const fetchInvoices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (DEMO_MODE) {
        await new Promise((r) => setTimeout(r, 600));
        setInvoices(mockInvoices);
      } else {
        const data = await invoiceService.getAll();
        setInvoices(data);
      }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to load invoices";
      setError(message);
      notify("Failed to load invoices", message);
    } finally {
      setIsLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices, user?.id]);

  const createInvoice = useCallback(
    async (payload: CreateInvoicePayload): Promise<Invoice | null> => {
      try {
        if (DEMO_MODE) {
          await new Promise((r) => setTimeout(r, 700));
          const newInvoice: Invoice = {
            id: Date.now(),
            invoice_number: `INV-2025-${String(invoices.length + 1).padStart(3, "0")}`,
            customer_id: payload.customer_id,
            subtotal: payload.items.reduce(
              (s, i) => s + i.quantity * i.unit_price,
              0,
            ),
            tax: 0,
            total: 0,
            status: "draft",
            items: payload.items.map((item, idx) => ({
              id: idx + 1,
              ...item,
              total_price: item.quantity * item.unit_price,
            })),
            created_at: new Date().toISOString(),
          };
          newInvoice.tax = payload.apply_tax ? newInvoice.subtotal * 0.15 : 0;
          newInvoice.total = newInvoice.subtotal + newInvoice.tax;
          setInvoices((prev) => [newInvoice, ...prev]);
          success(
            "Invoice created",
            `${newInvoice.invoice_number} has been saved.`,
          );
          return newInvoice;
        } else {
          const invoice = await invoiceService.create(payload);
          setInvoices((prev) => [invoice, ...prev]);
          success(
            "Invoice created",
            `${invoice.invoice_number} has been saved.`,
          );
          return invoice;
        }
      } catch (e) {
        notify(
          "Failed to create invoice",
          e instanceof Error ? e.message : undefined,
        );
        return null;
      }
    },
    [invoices.length, success, notify],
  );

  const updateInvoice = useCallback(
    async (
      id: number,
      payload: UpdateInvoicePayload,
    ): Promise<Invoice | null> => {
      try {
        if (DEMO_MODE) {
          await new Promise((r) => setTimeout(r, 500));
          setInvoices((prev) =>
            prev.map((inv) => (inv.id === id ? { ...inv, ...payload } : inv)),
          );
          success("Invoice updated");
          return invoices.find((i) => i.id === id) ?? null;
        } else {
          const updated = await invoiceService.update(id, payload);
          setInvoices((prev) =>
            prev.map((inv) => (inv.id === id ? updated : inv)),
          );
          success("Invoice updated");
          return updated;
        }
      } catch (e) {
        notify(
          "Failed to update invoice",
          e instanceof Error ? e.message : undefined,
        );
        return null;
      }
    },
    [invoices, success, notify],
  );

  const deleteInvoice = useCallback(
    async (id: number): Promise<boolean> => {
      try {
        if (DEMO_MODE) {
          await new Promise((r) => setTimeout(r, 400));
          setInvoices((prev) => prev.filter((inv) => inv.id !== id));
          success("Invoice deleted");
          return true;
        } else {
          await invoiceService.delete(id);
          setInvoices((prev) => prev.filter((inv) => inv.id !== id));
          success("Invoice deleted");
          return true;
        }
      } catch (e) {
        notify(
          "Failed to delete invoice",
          e instanceof Error ? e.message : undefined,
        );
        return false;
      }
    },
    [success, notify],
  );

  return {
    invoices,
    isLoading,
    error,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
}
