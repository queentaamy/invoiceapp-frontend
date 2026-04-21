// ==============================================
// InvoiceFlow — API Service Layer
// All backend calls go through here.
// Base URL is pulled from .env
// ==============================================

import type {
  Customer,
  Invoice,
  CreateCustomerPayload,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  AuthCredentials,
  SignupPayload,
  AuthUser,
} from "../types";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const BASE_URL = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/+$/, "")
  : "https://invoice-flow-cktz.onrender.com";
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

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text.trim()) return {};

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text.trim();
  }
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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    throw new Error(
      `Network request failed. This is usually caused by CORS, backend downtime, or an incorrect API URL. (${message})`,
    );
  }

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) return undefined as T;
  return response.json();
}

function normalizeAuthUser(data: unknown, fallbackEmail: string): AuthUser {
  const accessToken = extractAuthToken(data);

  if (!accessToken) {
    throw new Error("Authentication failed: no access token returned.");
  }

  setToken(accessToken);
  localStorage.setItem("token", accessToken);

  return {
    id: findNumberField(data, ["id", "user_id", "userId"]) ?? 0,
    name:
      findStringField(data, ["name", "full_name", "username"]) ??
      fallbackEmail.split("@")[0],
    email: findStringField(data, ["email", "user_email"]) ?? fallbackEmail,
    token: accessToken,
  };
}

// ── Auth ──────────────────────────────────────

export const authService = {
  async login(credentials: AuthCredentials): Promise<AuthUser> {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(
        findStringField(data, ["detail", "message", "error"]) ?? "Login failed",
      );
    }

    return normalizeAuthUser(data, credentials.email);
  },

  async signup(payload: SignupPayload): Promise<AuthUser> {
    const response = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: payload.email,
        password: payload.password,
        name: payload.name,
      }),
    });

    const data = await parseResponseBody(response);

    if (!response.ok) {
      throw new Error(
        findStringField(data, ["detail", "message", "error"]) ??
          "Signup failed",
      );
    }

    return normalizeAuthUser(data, payload.email);
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
    return request<Customer[]>("/customers");
  },

  async getById(id: number): Promise<Customer> {
    return request<Customer>(`/customers/${id}`);
  },

  async create(payload: CreateCustomerPayload): Promise<Customer> {
    return request<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(
    id: number,
    payload: Partial<CreateCustomerPayload>,
  ): Promise<Customer> {
    return request<Customer>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<void> {
    return request<void>(`/customers/${id}`, { method: "DELETE" });
  },
};

// ── Invoices ──────────────────────────────────

export const invoiceService = {
  async getAll(): Promise<Invoice[]> {
    return request<Invoice[]>("/invoices");
  },

  async getById(id: number): Promise<Invoice> {
    return request<Invoice>(`/invoices/${id}`);
  },

  async create(payload: CreateInvoicePayload): Promise<Invoice> {
    return request<Invoice>("/invoices", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(id: number, payload: UpdateInvoicePayload): Promise<Invoice> {
    return request<Invoice>(`/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  async delete(id: number): Promise<void> {
    return request<void>(`/invoices/${id}`, { method: "DELETE" });
  },
};

export { getToken, setToken, removeToken };
