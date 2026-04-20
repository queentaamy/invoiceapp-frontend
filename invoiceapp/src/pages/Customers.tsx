import { useState } from "react";
import { Plus, Users, Mail, Trash2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import {
  Modal,
  EmptyState,
  SkeletonRow,
  ConfirmDialog,
} from "../components/ui/index";
import { useCustomers } from "../hooks/useCustomers";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(val);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const bgColors = [
  "bg-blue-100 text-blue-700",
  "bg-purple-100 text-purple-700",
  "bg-amber-100 text-amber-700",
  "bg-[#dfe2ff] text-[#1d229f]",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
];

export default function CustomersPage() {
  const { customers, isLoading, createCustomer, deleteCustomer } =
    useCustomers();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", email: "" });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    email?: string;
  }>({});

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  function validateForm() {
    const errs: typeof formErrors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleCreate() {
    if (!validateForm()) return;
    setIsCreating(true);
    const result = await createCustomer({
      name: form.name.trim(),
      email: form.email.trim(),
    });
    setIsCreating(false);
    if (result) {
      setIsModalOpen(false);
      setForm({ name: "", email: "" });
    }
  }

  async function handleDelete() {
    if (deleteId === null) return;
    setIsDeleting(true);
    await deleteCustomer(deleteId);
    setIsDeleting(false);
    setDeleteId(null);
  }

  return (
    <Layout
      title="Customers"
      actions={
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Plus size={14} />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Customer
        </Button>
      }
    >
      {/* Search */}
      <div className="pt-4">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftAddon={<Users size={14} />}
          className="max-w-sm"
        />
      </div>

      {/* Customer list */}
      <div className="overflow-hidden rounded-xl bg-card shadow-none ring-1 ring-zinc-200">
        {isLoading ? (
          <div className="px-5 divide-y divide-zinc-200">
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Users size={24} />}
            title={search ? "No customers found" : "No customers yet"}
            description={
              search
                ? "Try a different search term."
                : "Add your first customer to get started."
            }
            action={
              !search ? (
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Plus size={14} />}
                  onClick={() => setIsModalOpen(true)}
                >
                  Add Customer
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Table header */}
            <div className="grid grid-cols-12 border-b border-zinc-200 bg-muted/40 px-5 py-2.5">
              <div className="col-span-5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Customer
              </div>
              <div className="col-span-3 hidden text-xs font-semibold uppercase tracking-wide text-muted-foreground md:block">
                Email
              </div>
              <div className="col-span-2 hidden text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:block">
                Invoices
              </div>
              <div className="col-span-2 hidden text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:block">
                Total Billed
              </div>
              <div className="col-span-1" />
            </div>

            <div className="divide-y divide-zinc-200">
              {filtered.map((c, idx) => (
                <div
                  key={c.id}
                  className="group grid grid-cols-12 items-center px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  {/* Name + avatar */}
                  <div className="col-span-5 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${bgColors[idx % bgColors.length]}`}
                    >
                      {getInitials(c.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {c.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground md:hidden">
                        {c.email}
                      </p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="col-span-3 hidden items-center gap-1.5 text-sm text-muted-foreground md:flex">
                    <Mail
                      size={12}
                      className="shrink-0 text-muted-foreground/60"
                    />
                    <span className="truncate">{c.email}</span>
                  </div>

                  {/* Invoice count */}
                  <div className="col-span-2 hidden lg:block">
                    <span className="text-sm text-foreground/80">
                      {c.invoiceCount ?? 0}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="col-span-2 hidden lg:block">
                    <span className="text-sm font-medium text-foreground">
                      {formatCurrency(c.totalBilled ?? 0)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-7 flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 md:col-span-1">
                    <Link to={`/invoices?customer=${c.id}`}>
                      <button
                        className="rounded-lg p-1.5 text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                        title="View invoices"
                      >
                        <FileText size={14} />
                      </button>
                    </Link>
                    <button
                      onClick={() => setDeleteId(c.id)}
                      className="p-1.5 rounded-lg text-ink-400 hover:text-red-500 hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Create customer modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Customer"
        size="sm"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Full name"
            placeholder="Acme Corporation"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={formErrors.name}
            required
          />
          <Input
            label="Email address"
            type="email"
            placeholder="billing@acme.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={formErrors.email}
            required
          />
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              isLoading={isCreating}
              onClick={handleCreate}
            >
              Add Customer
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete customer?"
        message="This will permanently remove the customer and cannot be undone."
        confirmLabel="Delete"
        isLoading={isDeleting}
      />
    </Layout>
  );
}
