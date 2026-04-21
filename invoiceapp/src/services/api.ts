// ==============================================
// InvoiceFlow — API Service Layer
// All backend calls go through here.
// Base URL is pulled from .env
// ==============================================

import type { AxiosRequestConfig } from "axios";
import api, { normalizeApiError } from "../api/client";
import type {
  Customer,
  Invoice,
  CreateCustomerPayload,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  AuthCredentials,
  SignupPayload,
  AuthUser,
  AuthProfile,
} from "../types";

const TOKEN_KEY = "invoiceflow_token";

// ── Helpers ──────────────────────────────────

function getToken(): string | null {
  const directToken = localStorage.getItem(TOKEN_KEY);
  if (directToken) return directToken;

  const storedUser = localStorage.getItem("invoiceflow_user");
  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser) as { token?: unknown };
    return typeof user.token === "string" ? user.token : null;
  } catch {
    return null;
  }
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function findStringField(
  value: unknown,
  keys: string[],
  depth = 0,
): string | null {
  if (depth > 4 || value == null) return null;

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    for (const key of keys) {
      const candidate = record[key];
      if (typeof candidate === "string" && candidate.trim()) {
        return candidate.trim();
      }
    }

    for (const nested of Object.values(record)) {
      const found = findStringField(nested, keys, depth + 1);
      if (found) return found;
    }
  }

  return null;
}

function findNumberField(
  value: unknown,
  keys: string[],
  depth = 0,
): number | null {
  if (depth > 4 || value == null) return null;

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;

    for (const key of keys) {
      const candidate = record[key];
      if (typeof candidate === "number" && Number.isFinite(candidate)) {
        return candidate;
      }
    }

    for (const nested of Object.values(record)) {
      const found = findNumberField(nested, keys, depth + 1);
      if (found != null) return found;
    }
  }

  return null;
}

function extractAuthToken(data: unknown): string | null {
  if (typeof data === "string") {
    const trimmed = data.trim();
    return trimmed || null;
  }

  return findStringField(data, [
    "access_token",
    "accessToken",
    "token",
    "auth_token",
    "jwt",
  ]);
}

function extractStoredNameForEmail(email: string): string | null {
  const storedUser = localStorage.getItem("invoiceflow_user");
  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser) as { email?: unknown; name?: unknown };
    const storedEmail =
      typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
    const targetEmail = email.trim().toLowerCase();

    if (storedEmail !== targetEmail) return null;

    const storedName = typeof user.name === "string" ? user.name.trim() : "";
    return storedName || null;
  } catch {
    return null;
  }
}

function normalizeAuthProfile(data: unknown): AuthProfile {
  const directName = findStringField(data, [
    "name",
    "full_name",
    "display_name",
    "displayName",
    "user_name",
    "username",
  ]);

  const firstName = findStringField(data, [
    "first_name",
    "firstName",
    "given_name",
    "givenName",
  ]);
  const lastName = findStringField(data, [
    "last_name",
    "lastName",
    "family_name",
    "familyName",
    "surname",
  ]);

  const combinedName = [firstName, lastName]
    .filter((part): part is string => !!part)
    .join(" ")
    .trim();

  return {
    id: findNumberField(data, ["id", "user_id", "userId"]) ?? undefined,
    email: findStringField(data, ["email", "user_email"]) ?? undefined,
    name: (directName ?? combinedName) || undefined,
  };
}

async function request<T>(
  config: AxiosRequestConfig,
  fallbackMessage: string,
): Promise<T> {
  try {
    const response = await api.request<T>(config);
    return response.data;
  } catch (err) {
    throw normalizeApiError(err, fallbackMessage);
  }
}

function normalizeAuthUser(
  data: unknown,
  fallbackEmail: string,
  fallbackName?: string,
): AuthUser {
  const accessToken = extractAuthToken(data);

  if (!accessToken) {
    throw new Error("Authentication failed: no access token returned.");
  }

  setToken(accessToken);
  localStorage.setItem("token", accessToken);

  const resolvedEmail =
    findStringField(data, ["email", "user_email"]) ?? fallbackEmail;

  const directName = findStringField(data, [
    "name",
    "full_name",
    "display_name",
    "displayName",
    "user_name",
    "username",
  ]);

  const firstName = findStringField(data, [
    "first_name",
    "firstName",
    "given_name",
    "givenName",
  ]);
  const lastName = findStringField(data, [
    "last_name",
    "lastName",
    "family_name",
    "familyName",
    "surname",
  ]);

  const combinedName = [firstName, lastName]
    .filter((part): part is string => !!part)
    .join(" ")
    .trim();

  const storedName = extractStoredNameForEmail(resolvedEmail);

  return {
    id: findNumberField(data, ["id", "user_id", "userId"]) ?? 0,
    name:
      (directName ?? combinedName) ||
      fallbackName?.trim() ||
      storedName ||
      "User",
    email: resolvedEmail,
    token: accessToken,
  };
}

// ── Auth ──────────────────────────────────────

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthUser> {
    const data = await request<unknown>(
      {
        url: "/login",
        method: "POST",
        data: {
          email: credentials.email,
          password: credentials.password,
        },
      },
      "Login failed",
    );

    return normalizeAuthUser(data, credentials.email);
  },

  async getProfile(): Promise<AuthProfile> {
    const data = await request<unknown>(
      {
        url: "/profile",
        method: "GET",
      },
      "Failed to load profile",
    );

    return normalizeAuthProfile(data);
  },

  async signup(payload: SignupPayload): Promise<AuthUser> {
    const data = await request<unknown>(
      {
        url: "/signup",
        method: "POST",
        data: {
          email: payload.email,
          password: payload.password,
          name: payload.name,
        },
      },
      "Signup failed",
    );

    return normalizeAuthUser(data, payload.email, payload.name);
  },

  logout(): void {
    removeToken();
  },

  isAuthenticated(): boolean {
    return !!getToken();
  },
};

// ── Customers ─────────────────────────────────

export const customerService = {
  async getAll(): Promise<Customer[]> {
    return request<Customer[]>(
      {
        url: "/customers",
        method: "GET",
      },
      "Failed to load customers",
    );
  },

  async getById(id: number): Promise<Customer> {
    return request<Customer>(
      {
        url: `/customers/${id}`,
        method: "GET",
      },
      "Failed to load customer",
    );
  },

  async create(payload: CreateCustomerPayload): Promise<Customer> {
    return request<Customer>(
      {
        url: "/customers",
        method: "POST",
        data: payload,
      },
      "Failed to create customer",
    );
  },

  async update(
    id: number,
    payload: Partial<CreateCustomerPayload>,
  ): Promise<Customer> {
    return request<Customer>(
      {
        url: `/customers/${id}`,
        method: "PUT",
        data: payload,
      },
      "Failed to update customer",
    );
  },

  async delete(id: number): Promise<string | undefined> {
    const data = await request<unknown>(
      {
        url: `/customers/${id}`,
        method: "DELETE",
      },
      "Failed to delete customer",
    );

    if (typeof data === "string") return data;
    if (data && typeof data === "object") {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message.trim()) {
        return message.trim();
      }
    }

    return undefined;
  },
};

// ── Invoices ──────────────────────────────────

export const invoiceService = {
  async getAll(): Promise<Invoice[]> {
    return request<Invoice[]>(
      {
        url: "/invoices",
        method: "GET",
      },
      "Failed to load invoices",
    );
  },

  async getById(id: number): Promise<Invoice> {
    return request<Invoice>(
      {
        url: `/invoices/${id}`,
        method: "GET",
      },
      "Failed to load invoice",
    );
  },

  async create(payload: CreateInvoicePayload): Promise<Invoice> {
    return request<Invoice>(
      {
        url: "/invoices",
        method: "POST",
        data: payload,
      },
      "Failed to create invoice",
    );
  },

  async update(id: number, payload: UpdateInvoicePayload): Promise<Invoice> {
    return request<Invoice>(
      {
        url: `/invoices/${id}`,
        method: "PUT",
        data: payload,
      },
      "Failed to update invoice",
    );
  },

  async delete(id: number): Promise<void> {
    await request<void>(
      {
        url: `/invoices/${id}`,
        method: "DELETE",
      },
      "Failed to delete invoice",
    );
  },
};

export { getToken, setToken, removeToken };
