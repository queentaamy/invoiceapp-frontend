import axios, { type AxiosError } from "axios";

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const baseURL = configuredBaseUrl
  ? configuredBaseUrl.replace(/\/+$/, "")
  : "https://invoice-flow-cktz.onrender.com";

function readStoredToken(): string | null {
  const directToken = localStorage.getItem("invoiceflow_token");
  if (directToken) return directToken;

  const fallbackToken = localStorage.getItem("token");
  if (fallbackToken) return fallbackToken;

  const storedUser = localStorage.getItem("invoiceflow_user");
  if (!storedUser) return null;

  try {
    const user = JSON.parse(storedUser) as { token?: unknown };
    return typeof user.token === "string" && user.token.trim()
      ? user.token.trim()
      : null;
  } catch {
    return null;
  }
}

export function normalizeApiError(
  error: unknown,
  fallbackMessage: string,
): Error {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error : new Error(fallbackMessage);
  }

  const axiosError = error as AxiosError<unknown>;
  const payload = axiosError.response?.data;

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const detail = record.detail;
    if (typeof detail === "string" && detail.trim()) {
      return new Error(detail.trim());
    }

    const message = record.message;
    if (typeof message === "string" && message.trim()) {
      return new Error(message.trim());
    }

    const errorText = record.error;
    if (typeof errorText === "string" && errorText.trim()) {
      return new Error(errorText.trim());
    }
  }

  if (typeof payload === "string" && payload.trim()) {
    return new Error(payload.trim());
  }

  if (axiosError.message) {
    return new Error(axiosError.message);
  }

  return new Error(fallbackMessage);
}

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = readStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
