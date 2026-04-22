import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Download,
  Send,
  CheckCircle,
  FileText,
  User,
  Calendar,
  Hash,
} from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { StatusBadge, ConfirmDialog } from "../components/ui/index";
import { useInvoices } from "../hooks/useInvoices";
import { useCustomers } from "../hooks/useCustomers";
import { useNotification } from "../context/NotificationContext";
import type { Invoice, InvoiceStatus } from "../types";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GHS",
  }).format(val);
}

function formatDate(str?: string) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

async function loadLogoDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, markInvoicePaid, deleteInvoice } = useInvoices();
  const { customers } = useCustomers();
  const { success, error } = useNotification();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  useEffect(() => {
    const found = invoices.find((i) => i.id === Number(id));
    if (found) setInvoice(found);
  }, [invoices, id]);

  const customerNameById = useMemo(
    () => new Map(customers.map((c) => [c.id, c.name])),
    [customers],
  );

  const customerEmailById = useMemo(
    () => new Map(customers.map((c) => [c.id, c.email])),
    [customers],
  );

  async function handleDelete() {
    if (!invoice) return;
    setIsDeleting(true);
    const ok = await deleteInvoice(invoice.id);
    setIsDeleting(false);
    if (ok) navigate("/invoices");
  }

  async function handleMarkPaid() {
    if (!invoice) return;
    setIsMarkingPaid(true);
    const updated = await markInvoicePaid(invoice.id);
    setIsMarkingPaid(false);
    if (updated) setInvoice(updated);
  }

  async function handleDownload() {
    if (!invoice) return;

    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const left = 40;
      const right = pageWidth - 40;
      const brandBlue: [number, number, number] = [43, 49, 233];
      const logoDataUrl = await loadLogoDataUrl(
        `${window.location.origin}/app-icon.png`,
      );
      let y = 126;

      const statusValue = (
        invoice.status ?? (invoice as { payment_status?: string }).payment_status
      )
        ?.toString()
        .toUpperCase() || "UNPAID";

      const resolvedInvoiceNumber = invoice.invoice_number?.trim()
        ? invoice.invoice_number
        : `INV-${String(invoice.id).padStart(3, "0")}`;

      const resolvedCreatedDate =
        invoice.created_at ??
        (invoice as { createdAt?: string }).createdAt ??
        (invoice as { date?: string }).date;

      const resolvedDueDate =
        invoice.due_date ??
        (invoice as { dueDate?: string }).dueDate ??
        (invoice as { due?: string }).due;

      const customerName =
        invoice.customer?.name ??
        customerNameById.get(invoice.customer_id) ??
        `Customer #${invoice.customer_id}`;

      const customerEmail =
        invoice.customer?.email ?? customerEmailById.get(invoice.customer_id) ?? "";

      const drawTableHeader = (headerY: number) => {
        doc.setFillColor(245, 247, 251);
        doc.rect(left, headerY - 14, right - left, 24, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(60, 72, 96);
        doc.text("Item", left + 8, headerY);
        doc.text("Qty", left + 285, headerY, { align: "right" });
        doc.text("Unit", left + 390, headerY, { align: "right" });
        doc.text("Total", right - 8, headerY, { align: "right" });
      };

      doc.setFillColor(...brandBlue);
      doc.rect(0, 0, pageWidth, 96, "F");

      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", left, 24, 38, 38);
      }

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("InvoiceFlow", logoDataUrl ? left + 50 : left, 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Professional billing document", logoDataUrl ? left + 50 : left, 58);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("INVOICE", right, 46, { align: "right" });

      doc.setFillColor(statusValue === "PAID" ? 34 : 234, statusValue === "PAID" ? 197 : 179, statusValue === "PAID" ? 94 : 8);
      doc.roundedRect(right - 98, 58, 98, 20, 10, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(statusValue, right - 49, 72, { align: "center" });

      doc.setTextColor(17, 24, 39);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text(resolvedInvoiceNumber, left, y);

      y += 18;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Created: ${formatDate(resolvedCreatedDate)}`, left, y);
      doc.text(`Due: ${formatDate(resolvedDueDate)}`, left + 160, y);

      y += 28;
      doc.setDrawColor(220, 226, 236);
      doc.line(left, y, right, y);

      y += 24;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Bill To", left, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      y += 16;
      doc.text(customerName, left, y);
      if (customerEmail) {
        y += 14;
        doc.text(customerEmail, left, y);
      }

      y += 28;
      drawTableHeader(y);
      y += 22;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(17, 24, 39);
      const lineItems = invoice.items ?? [];
      for (const item of lineItems) {
        if (y > pageHeight - 90) {
          doc.addPage();
          y = 56;
          drawTableHeader(y);
          y += 22;
        }

        doc.text(item.item_name, left, y);
        doc.text(String(item.quantity), left + 285, y, { align: "right" });
        doc.text(formatCurrency(item.unit_price), left + 390, y, {
          align: "right",
        });
        doc.text(
          formatCurrency(item.total_price ?? item.quantity * item.unit_price),
          right,
          y,
          { align: "right" },
        );

        y += 18;
      }

      y += 6;
      doc.line(left, y, right, y);
      y += 22;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(75, 85, 99);
      doc.text("Subtotal", right - 120, y, { align: "right" });
      doc.setTextColor(17, 24, 39);
      doc.text(formatCurrency(invoice.subtotal), right, y, { align: "right" });

      y += 16;
      doc.setTextColor(75, 85, 99);
      doc.text("Tax (15%)", right - 120, y, { align: "right" });
      doc.setTextColor(17, 24, 39);
      doc.text(formatCurrency(invoice.tax), right, y, { align: "right" });

      y += 22;
      doc.setDrawColor(220, 226, 236);
      doc.line(right - 150, y - 11, right, y - 11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...brandBlue);
      doc.text("Total", right - 120, y, { align: "right" });
      doc.text(formatCurrency(invoice.total), right, y, { align: "right" });

      if (invoice.notes) {
        y += 30;
        if (y > pageHeight - 100) {
          doc.addPage();
          y = 56;
        }
        doc.setFont("helvetica", "bold");
        doc.setTextColor(17, 24, 39);
        doc.text("Notes", left, y);
        y += 14;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const wrappedNotes = doc.splitTextToSize(invoice.notes, right - left);
        doc.text(wrappedNotes, left, y);
      }

      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString("en-US")}`,
        left,
        pageHeight - 22,
      );
      doc.text("InvoiceFlow", right, pageHeight - 22, { align: "right" });

      doc.save(`${resolvedInvoiceNumber}.pdf`);
      success("PDF downloaded", `${resolvedInvoiceNumber}.pdf has been saved.`);
    } catch {
      error("Download failed", "We could not generate the invoice PDF.");
    }
  }

  if (!invoice) {
    return (
      <Layout title="Invoice">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <FileText size={24} className="text-muted-foreground" />
          </div>
          <p className="font-medium text-foreground/80">Invoice not found</p>
          <Link to="/invoices">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<ArrowLeft size={14} />}
            >
              Back to Invoices
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const rawStatus = (
    invoice.status ?? (invoice as { payment_status?: string }).payment_status
  )
    ?.toString()
    .toLowerCase();

  const status: InvoiceStatus =
    rawStatus === "paid" ||
    rawStatus === "unpaid" ||
    rawStatus === "overdue" ||
    rawStatus === "draft"
      ? rawStatus
      : (invoice as { is_paid?: boolean }).is_paid
        ? "paid"
        : "unpaid";

  const createdDate =
    invoice.created_at ??
    (invoice as { createdAt?: string }).createdAt ??
    (invoice as { date?: string }).date;

  const dueDate =
    invoice.due_date ??
    (invoice as { dueDate?: string }).dueDate ??
    (invoice as { due?: string }).due;

  const invoiceNumber = invoice.invoice_number?.trim()
    ? invoice.invoice_number
    : `INV-${String(invoice.id).padStart(3, "0")}`;

  return (
    <Layout
      title={invoiceNumber}
      actions={
        <div className="flex items-center gap-2">
          {status !== "paid" && (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<CheckCircle size={14} />}
              isLoading={isMarkingPaid}
              onClick={handleMarkPaid}
            >
              Mark Paid
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={handleDownload}
          >
            Download
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={() => setShowDelete(true)}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            Delete
          </Button>
        </div>
      }
    >
      {/* Back link */}
      <Link
        to="/invoices"
        className="inline-flex items-center gap-1.5 pt-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to Invoices
      </Link>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Main invoice card */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Header */}
          <div className="rounded-xl bg-card p-5 shadow-none ring-1 ring-zinc-200 sm:p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono text-muted-foreground">
                    {invoiceNumber}
                  </span>
                  <StatusBadge status={status} />
                </div>
                <h2 className="text-xl font-bold text-foreground">Invoice</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground">
                <FileText size={18} className="text-[#747fff]" />
              </div>
            </div>

            {/* Meta row */}
            <div className="grid grid-cols-2 gap-4 border-b border-zinc-200 pb-6 sm:grid-cols-3">
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar size={11} /> Created
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(createdDate)}
                </p>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar size={11} /> Due date
                </p>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(dueDate)}
                </p>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Hash size={11} /> Items
                </p>
                <p className="text-sm font-medium text-foreground">
                  {invoice.items?.length ?? 0}
                </p>
              </div>
            </div>

            {/* Line items */}
            <div className="mt-5">
              <div className="hidden sm:block">
                <div className="grid grid-cols-12 gap-3 border-b border-zinc-200 pb-2">
                  <div className="col-span-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Item
                  </div>
                  <div className="col-span-2 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Qty
                  </div>
                  <div className="col-span-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Unit
                  </div>
                  <div className="col-span-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Total
                  </div>
                </div>

                {(invoice.items ?? []).map((item, i) => (
                  <div
                    key={item.id ?? i}
                    className="grid grid-cols-12 items-center gap-3 border-b border-zinc-200 py-3 last:border-0"
                  >
                    <div className="col-span-5 min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {item.item_name}
                      </p>
                    </div>
                    <div className="col-span-2 text-center text-sm text-muted-foreground">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-right text-sm text-muted-foreground">
                      {formatCurrency(item.unit_price)}
                    </div>
                    <div className="col-span-3 text-right text-sm font-semibold text-foreground">
                      {formatCurrency(
                        item.total_price ?? item.quantity * item.unit_price,
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 sm:hidden">
                {(invoice.items ?? []).map((item, i) => (
                  <div
                    key={item.id ?? i}
                    className="rounded-xl border border-zinc-200 p-4"
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {item.item_name}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      <div className="rounded-lg bg-muted/40 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Qty
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          {item.quantity}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/40 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Unit
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          {formatCurrency(item.unit_price)}
                        </p>
                      </div>
                      <div className="rounded-lg bg-muted/40 px-3 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Total
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {formatCurrency(
                            item.total_price ?? item.quantity * item.unit_price,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="mt-4 flex flex-col items-end gap-2 border-t border-zinc-200 pt-4">
              <div className="flex justify-between w-48">
                <p className="text-sm text-muted-foreground">Subtotal</p>
                <p className="text-sm font-medium text-foreground">
                  {formatCurrency(invoice.subtotal)}
                </p>
              </div>
              <div className="flex justify-between w-48">
                <p className="text-sm text-muted-foreground">Tax (15%)</p>
                <p className="text-sm font-medium text-foreground">
                  {formatCurrency(invoice.tax)}
                </p>
              </div>
              <div className="flex w-48 justify-between border-t border-zinc-200 pt-2">
                <p className="text-sm font-bold text-foreground">Total</p>
                <p className="text-base font-bold text-foreground">
                  {formatCurrency(invoice.total)}
                </p>
              </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="mt-5 border-t border-zinc-200 pt-4">
                <p className="mb-1 text-xs text-muted-foreground">Notes</p>
                <p className="text-sm text-foreground/80">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-4">
          {/* Customer card */}
          <div className="rounded-xl bg-card p-5 shadow-none ring-1 ring-zinc-200 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                <User size={14} className="text-blue-600" />
              </div>
              <p className="text-sm font-semibold text-foreground">Customer</p>
            </div>
            {invoice.customer ? (
              <div className="flex flex-col gap-1.5">
                <p className="font-semibold text-foreground">
                  {invoice.customer.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {invoice.customer.email}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <p className="font-semibold text-foreground">
                  {customerNameById.get(invoice.customer_id) ??
                    `Customer #${invoice.customer_id}`}
                </p>
                {customerEmailById.get(invoice.customer_id) ? (
                  <p className="text-sm text-muted-foreground">
                    {customerEmailById.get(invoice.customer_id)}
                  </p>
                ) : null}
              </div>
            )}
          </div>

          {/* Payment status card */}
          <div className="rounded-xl bg-card p-5 shadow-none ring-1 ring-zinc-200 sm:p-6">
            <p className="mb-3 text-sm font-semibold text-foreground">
              Payment Status
            </p>
            <div className="flex items-center justify-between">
              <StatusBadge status={status} />
              <p className="text-base font-bold text-foreground">
                {formatCurrency(invoice.total)}
              </p>
            </div>
            {status !== "paid" && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full mt-4"
                leftIcon={<CheckCircle size={14} />}
                isLoading={isMarkingPaid}
                onClick={handleMarkPaid}
              >
                Mark as Paid
              </Button>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 rounded-xl bg-card p-5 shadow-none ring-1 ring-zinc-200 sm:p-6">
            <p className="mb-1 text-sm font-semibold text-foreground">
              Actions
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              leftIcon={<Send size={14} />}
            >
              Send Reminder
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              leftIcon={<Download size={14} />}
              onClick={handleDownload}
            >
              Download PDF
            </Button>
            <Link to={`/invoices/${invoice.id}/edit`}>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
                leftIcon={<Pencil size={14} />}
              >
                Edit Invoice
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete this invoice?"
        message={`Invoice ${invoiceNumber} will be permanently deleted.`}
        confirmLabel="Delete Invoice"
        isLoading={isDeleting}
      />
    </Layout>
  );
}
