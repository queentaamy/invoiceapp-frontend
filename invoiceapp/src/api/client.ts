import axios, { type AxiosError } from "axios";

function formatValidationDetail(detail: unknown): string | null {
  if (!Array.isArray(detail)) return null;

  const messages = detail
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const record = item as Record<string, unknown>;
      const msg =
        typeof record.msg === "string" && record.msg.trim()
          ? record.msg.trim()
          : null;
      if (!msg) return null;

      const loc = Array.isArray(record.loc)
        ? record.loc
            .filter((segment): segment is string | number =>
              typeof segment === "string" || typeof segment === "number",
            )
            .map((segment) => String(segment))
            .join(".")
        : "";

      return loc ? `${loc}: ${msg}` : msg;
    })
    .filter((message): message is string => !!message);

  if (!messages.length) return null;

  return messages.join("; ");
}

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

    const validationMessage = formatValidationDetail(detail);
    if (validationMessage) {
      return new Error(validationMessage);
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
