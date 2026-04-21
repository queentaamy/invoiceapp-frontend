import { useState, useEffect, useCallback } from "react";
import type { Customer, CreateCustomerPayload } from "../types";
import { customerService } from "../services/api";
import { mockCustomers } from "../services/mockData";
import { useNotification } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";

const DEMO_MODE = import.meta.env.VITE_ENABLE_DEMO_MODE === "true";

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
        const data = await customerService.getAll();
        setCustomers(data);
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
    fetchCustomers();
  }, [fetchCustomers, user?.id]);

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
          const customer = await customerService.create(payload);
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
        if (DEMO_MODE) {
          await new Promise((r) => setTimeout(r, 400));
          setCustomers((prev) => prev.filter((c) => c.id !== id));
          success("Customer removed");
          return true;
        } else {
          await customerService.delete(id);
          setCustomers((prev) => prev.filter((c) => c.id !== id));
          success("Customer removed");
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
    [success, notify],
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
