// ==============================================
// InvoiceFlow — Core Type Definitions
// ==============================================

export interface Customer {
  id: number;
  name: string;
  email: string;
  invoiceCount?: number;
  totalBilled?: number;
  createdAt?: string;
}

export interface InvoiceItem {
  id?: number;
  invoice_id?: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
}

export type InvoiceStatus = "paid" | "unpaid" | "overdue" | "draft";

export interface Invoice {
  id: number;
  invoice_number: string;
  customer_id: number;
  customer?: Customer;
  subtotal: number;
  tax: number;
  total: number;
  status?: InvoiceStatus;
  items?: InvoiceItem[];
  created_at?: string;
  due_date?: string;
  notes?: string;
}

export interface CreateCustomerPayload {
  name: string;
  email: string;
}

export interface CreateInvoicePayload {
  customer_id: number;
  items: Omit<InvoiceItem, "id" | "invoice_id" | "total_price">[];
  apply_tax?: boolean;
  status?: InvoiceStatus;
  due_date?: string;
  notes?: string;
}

export interface UpdateInvoicePayload extends Partial<CreateInvoicePayload> {
  status?: InvoiceStatus;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface SignupPayload extends AuthCredentials {
  name: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  token: string;
}

export interface AuthProfile {
  id?: number;
  name?: string;
  email?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

export interface DashboardStats {
  totalInvoices: number;
  totalCustomers: number;
  totalRevenue: number;
  unpaidInvoices: number;
  recentInvoices: Invoice[];
}
