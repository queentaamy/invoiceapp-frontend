import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { Select } from "../components/ui/Input";
import { useInvoices } from "../hooks/useInvoices";
import type { Invoice, InvoiceStatus } from "../types";

const statusOptions: { value: InvoiceStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "overdue", label: "Overdue" },
];

export default function EditInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, updateInvoice } = useInvoices();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [status, setStatus] = useState<InvoiceStatus>("draft");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const found = invoices.find((i) => i.id === Number(id));
    if (found) {
      setInvoice(found);
      setStatus((found.status ?? "draft") as InvoiceStatus);
      setNotes(found.notes ?? "");
      setDueDate(found.due_date ?? "");
    }
  }, [invoices, id]);

  async function handleSave() {
    if (!invoice) return;
    setIsSaving(true);
    await updateInvoice(invoice.id, { status, notes, due_date: dueDate });
    setIsSaving(false);
    navigate(`/invoices/${invoice.id}`);
  }

  if (!invoice) {
    return (
      <Layout title="Edit Invoice">
        <p className="py-12 text-center text-muted-foreground">
          Loading invoice...
        </p>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit ${invoice.invoice_number}`}>
      <Link
        to={`/invoices/${invoice.id}`}
        className="inline-flex items-center gap-1.5 pt-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} /> Back to Invoice
      </Link>

      <div className="max-w-lg">
        <div className="flex flex-col gap-4 rounded-xl bg-card p-5 shadow-none ring-1 ring-zinc-200 sm:p-6">
          <h3 className="font-semibold text-foreground">Update Invoice</h3>

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
            options={statusOptions}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm transition-all focus:border-[#2B31E9] focus:outline-none focus:ring-2 focus:ring-[#2B31E9]/30"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes..."
              className="resize-none rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm transition-all focus:border-[#2B31E9] focus:outline-none focus:ring-2 focus:ring-[#2B31E9]/30"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(`/invoices/${invoice.id}`)}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              leftIcon={<Save size={14} />}
              isLoading={isSaving}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
