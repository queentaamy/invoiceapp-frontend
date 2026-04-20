// ==============================================
// InvoiceFlow — Mock / Demo Data
// Used when VITE_ENABLE_DEMO_MODE=true
// ==============================================

import type { Customer, Invoice, DashboardStats } from '../types'

export const mockCustomers: Customer[] = [
  { id: 1, name: 'Acme Corporation', email: 'billing@acme.com', invoiceCount: 5, totalBilled: 24500, createdAt: '2024-11-01' },
  { id: 2, name: 'Bright Ideas Studio', email: 'accounts@brightideas.io', invoiceCount: 3, totalBilled: 8750, createdAt: '2024-12-10' },
  { id: 3, name: 'Nova Tech Ltd', email: 'finance@novatech.com', invoiceCount: 7, totalBilled: 61200, createdAt: '2024-10-05' },
  { id: 4, name: 'Green Leaf Co.', email: 'greenleaf@outlook.com', invoiceCount: 2, totalBilled: 3100, createdAt: '2025-01-20' },
  { id: 5, name: 'Harbor Digital', email: 'hello@harbordigital.co', invoiceCount: 4, totalBilled: 17800, createdAt: '2025-02-14' },
]

export const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoice_number: 'INV-2025-001',
    customer_id: 1,
    customer: mockCustomers[0],
    subtotal: 5000,
    tax: 750,
    total: 5750,
    status: 'paid',
    created_at: '2025-03-01',
    due_date: '2025-03-31',
    items: [
      { id: 1, invoice_id: 1, item_name: 'Web Design', quantity: 1, unit_price: 3000, total_price: 3000 },
      { id: 2, invoice_id: 1, item_name: 'SEO Audit', quantity: 2, unit_price: 1000, total_price: 2000 },
    ],
  },
  {
    id: 2,
    invoice_number: 'INV-2025-002',
    customer_id: 3,
    customer: mockCustomers[2],
    subtotal: 12000,
    tax: 1800,
    total: 13800,
    status: 'unpaid',
    created_at: '2025-03-15',
    due_date: '2025-04-15',
    items: [
      { id: 3, invoice_id: 2, item_name: 'API Integration', quantity: 1, unit_price: 8000, total_price: 8000 },
      { id: 4, invoice_id: 2, item_name: 'Backend Setup', quantity: 4, unit_price: 1000, total_price: 4000 },
    ],
  },
  {
    id: 3,
    invoice_number: 'INV-2025-003',
    customer_id: 2,
    customer: mockCustomers[1],
    subtotal: 2500,
    tax: 0,
    total: 2500,
    status: 'overdue',
    created_at: '2025-02-01',
    due_date: '2025-03-01',
    items: [
      { id: 5, invoice_id: 3, item_name: 'Brand Consultation', quantity: 5, unit_price: 500, total_price: 2500 },
    ],
  },
  {
    id: 4,
    invoice_number: 'INV-2025-004',
    customer_id: 5,
    customer: mockCustomers[4],
    subtotal: 6800,
    tax: 1020,
    total: 7820,
    status: 'draft',
    created_at: '2025-04-01',
    due_date: '2025-04-30',
    items: [
      { id: 6, invoice_id: 4, item_name: 'Mobile App UI', quantity: 1, unit_price: 4800, total_price: 4800 },
      { id: 7, invoice_id: 4, item_name: 'Component Library', quantity: 2, unit_price: 1000, total_price: 2000 },
    ],
  },
  {
    id: 5,
    invoice_number: 'INV-2025-005',
    customer_id: 4,
    customer: mockCustomers[3],
    subtotal: 1500,
    tax: 225,
    total: 1725,
    status: 'paid',
    created_at: '2025-04-10',
    due_date: '2025-04-25',
    items: [
      { id: 8, invoice_id: 5, item_name: 'Logo Design', quantity: 1, unit_price: 1500, total_price: 1500 },
    ],
  },
]

export const mockDashboardStats: DashboardStats = {
  totalInvoices: 24,
  totalCustomers: 5,
  totalRevenue: 115250,
  unpaidInvoices: 3,
  recentInvoices: mockInvoices.slice(0, 4),
}
