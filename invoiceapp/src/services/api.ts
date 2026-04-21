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
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
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

function normalizeAuthUser(
  data: Record<string, unknown>,
  fallbackEmail: string,
): AuthUser {
  const accessToken =
    typeof data.access_token === "string"
      ? data.access_token
      : typeof data.token === "string"
        ? data.token
        : null;

  if (!accessToken) {
    throw new Error("Authentication failed: no access token returned.");
  }

  setToken(accessToken);
  localStorage.setItem("token", accessToken);

  return {
    id: typeof data.id === "number" ? data.id : 0,
    name:
      typeof data.name === "string" ? data.name : fallbackEmail.split("@")[0],
    email: typeof data.email === "string" ? data.email : fallbackEmail,
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

    const data = await response
      .json()
      .catch(() => ({}) as Record<string, unknown>);

    if (!response.ok) {
      throw new Error(
        typeof data?.detail === "string" ? data.detail : "Login failed",
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

    const data = await response
      .json()
      .catch(() => ({}) as Record<string, unknown>);

    if (!response.ok) {
      throw new Error(
        typeof data?.detail === "string" ? data.detail : "Signup failed",
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
