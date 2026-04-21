import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, Calculator } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { Input, Select, Textarea } from "../components/ui/Input";
import { useInvoices } from "../hooks/useInvoices";
import { useCustomers } from "../hooks/useCustomers";

interface LineItem {
  item_name: string;
  quantity: number;
  unit_price: number;
}

function toMinimumQuantity(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return parsed;
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GHS",
  }).format(val);
}

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const { createInvoice } = useInvoices();
  const { customers } = useCustomers();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerId, setCustomerId] = useState("");
  const [applyTax, setApplyTax] = useState(true);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { item_name: "", quantity: 1, unit_price: 0 },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function addItem() {
    setItems((prev) => [
      ...prev,
      { item_name: "", quantity: 1, unit_price: 0 },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateItem(
    index: number,
    field: keyof LineItem,
    value: string | number,
  ) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  const subtotal = items.reduce(
    (s, item) => s + item.quantity * item.unit_price,
    0,
  );
  const tax = applyTax ? subtotal * 0.15 : 0;
  const total = subtotal + tax;

  function validate() {
    const errs: Record<string, string> = {};
    if (!customerId) errs.customer = "Please select a customer";
    items.forEach((item, i) => {
      if (!item.item_name.trim()) errs[`item_${i}_name`] = "Item name required";
      if (item.quantity < 1) errs[`item_${i}_qty`] = "Min quantity is 1";
      if (item.unit_price <= 0) errs[`item_${i}_price`] = "Price must be > 0";
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const invoice = await createInvoice({
      customer_id: Number(customerId),
      items,
      apply_tax: applyTax,
      status: "unpaid",
      due_date: dueDate || undefined,
      notes: notes || undefined,
    });
    setIsSubmitting(false);
    if (invoice) navigate(`/invoices/${invoice.id}`);
  }

  return (
    <Layout title="New Invoice">
      <Link
        to="/invoices"
        className="inline-flex items-center gap-1.5 pt-4 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={14} />
        Back to Invoices
      </Link>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Customer + dates */}
            <div className="rounded-xl bg-card p-5 shadow-none ring-1 ring-zinc-200 sm:p-6">
              <h3 className="mb-4 font-semibold text-foreground">
                Invoice Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Select
                  label="Customer"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  options={customers.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  placeholder="Select a customer..."
                  error={errors.customer}
                  required
                />
                <Input
                  label="Due Date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>

            {/* Line items */}
            <div className="rounded-xl bg-card p-5 shadow-none ring-1 ring-zinc-200 sm:p-6">
              <div className="mb-4 flex items-center justify-between border-b border-zinc-200 pb-3">
                <h3 className="font-semibold text-foreground">Line Items</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  leftIcon={<Plus size={13} />}
                  onClick={addItem}
                >
                  Add Item
                </Button>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[620px]">
                  {/* Column headers */}
                  <div className="mb-3 grid grid-cols-12 gap-2">
                    <div className="col-span-6 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Description
                    </div>
                    <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Qty
                    </div>
                    <div className="col-span-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Unit Price
                    </div>
                    <div className="col-span-1" />
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {items.map((item, i) => (
                      <div
                        key={i}
                        className="grid grid-cols-12 items-start gap-2 border-b border-zinc-200 pb-2 last:border-b-0 last:pb-0"
                      >
                        <div className="col-span-6">
                          <Input
                            placeholder="e.g. Web Design"
                            value={item.item_name}
                            onChange={(e) =>
                              updateItem(i, "item_name", e.target.value)
                            }
                            error={errors[`item_${i}_name`]}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                i,
                                "quantity",
                                toMinimumQuantity(e.target.value),
                              )
                            }
                            error={errors[`item_${i}_qty`]}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={item.unit_price || ""}
                            onChange={(e) =>
                              updateItem(i, "unit_price", Number(e.target.value))
                            }
                            error={errors[`item_${i}_price`]}
                          />
                        </div>
                        <div className="col-span-1 flex justify-center pt-0.5">
                          <button
                            type="button"
                            onClick={() => removeItem(i)}
                            disabled={items.length === 1}
                            className="rounded-lg p-2 text-muted-foreground transition-all hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Subtotal for this line */}
                        {item.item_name && item.unit_price > 0 && (
                          <div className="col-span-12 -mt-1 px-1">
                            <p className="text-xs text-muted-foreground">
                              Line total:{" "}
                              <span className="font-medium text-foreground/80">
                                {formatCurrency(item.quantity * item.unit_price)}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="rounded-xl bg-card p-5 shadow-none ring-1 ring-zinc-200 sm:p-6">
              <Textarea
                label="Notes (optional)"
                placeholder="Payment terms, additional info, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-24"
              />
            </div>
          </div>

          {/* Summary sidebar */}
          <div className="flex flex-col gap-4">
            {/* Totals */}
            <div className="rounded-xl bg-card p-5 shadow-none ring-1 ring-zinc-200 sm:p-6 lg:sticky lg:top-24">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#eef0ff]">
                  <Calculator size={14} className="text-[#2B31E9]" />
                </div>
                <h3 className="font-semibold text-foreground">Summary</h3>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    {formatCurrency(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={applyTax}
                      onChange={(e) => setApplyTax(e.target.checked)}
                      className="h-3.5 w-3.5 accent-[#2B31E9]"
                    />
                    Tax (15%)
                  </label>
                  <span className="text-sm font-medium text-foreground">
                    {formatCurrency(tax)}
                  </span>
                </div>

                <div className="flex justify-between border-t border-zinc-200 pt-3">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="text-lg font-bold text-foreground">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                variant="secondary"
                size="lg"
                isLoading={isSubmitting}
                className="w-full mt-5"
              >
                Create Invoice
              </Button>

              <p className="mt-2 text-center text-xs text-muted-foreground">
                Invoice will be created as unpaid
              </p>
            </div>
          </div>
        </div>
      </form>
    </Layout>
  );
}
