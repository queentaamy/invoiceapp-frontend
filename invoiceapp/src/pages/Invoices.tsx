import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Plus, FileText, Search, ArrowRight, Filter } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { StatusBadge, EmptyState, SkeletonRow } from "../components/ui/index";
import { useInvoices } from "../hooks/useInvoices";
import type { InvoiceStatus } from "../types";
import clsx from "clsx";

function formatCurrency(val: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "GHS",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatDate(str?: string) {
  if (!str) return "—";
  return new Date(str).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const statusFilters: { label: string; value: string }[] = [
  { label: "All", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Unpaid", value: "unpaid" },
  { label: "Overdue", value: "overdue" },
  { label: "Draft", value: "draft" },
];

export default function InvoicesPage() {
  const { invoices, isLoading } = useInvoices();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        (inv.customer?.name ?? "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const totals = useMemo(
    () => ({
      total: invoices.reduce((s, i) => s + i.total, 0),
      unpaid: invoices
        .filter((i) => i.status === "unpaid" || i.status === "overdue")
        .reduce((s, i) => s + i.total, 0),
    }),
    [invoices],
  );

  return (
    <Layout
      title="Invoices"
      actions={
        <Link to="/invoices/new">
          <Button variant="secondary" size="sm" leftIcon={<Plus size={14} />}>
            New Invoice
          </Button>
        </Link>
      }
    >
      {/* Summary chips */}
      {!isLoading && invoices.length > 0 && (
        <div className="flex flex-wrap gap-3 pt-4">
          <div className="rounded-xl border border-zinc-200 bg-card px-4 py-2 text-sm shadow-none">
            <span className="text-muted-foreground">Total billed: </span>
            <span className="font-semibold text-foreground">
              {formatCurrency(totals.total)}
            </span>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-amber-50 px-4 py-2 text-sm">
            <span className="text-amber-600">Outstanding: </span>
            <span className="font-semibold text-amber-800">
              {formatCurrency(totals.unpaid)}
            </span>
          </div>
        </div>
      )}

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search by number or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftAddon={<Search size={14} />}
          className="max-w-xs"
        />
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-card p-1 shadow-none">
          <Filter size={12} className="ml-2 mr-1 text-muted-foreground" />
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={clsx(
                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                statusFilter === f.value
                  ? "bg-foreground text-background shadow-none"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-card shadow-none ring-1 ring-zinc-200">
        {isLoading ? (
          <div className="divide-y divide-zinc-200 px-5">
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText size={24} />}
            title={
              search || statusFilter !== "all"
                ? "No invoices match your filters"
                : "No invoices yet"
            }
            description={
              !search && statusFilter === "all"
                ? "Create your first invoice to get started."
                : undefined
            }
            action={
              !search && statusFilter === "all" ? (
                <Link to="/invoices/new">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Plus size={14} />}
                  >
                    New Invoice
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* Header */}
            <div className="grid grid-cols-12 border-b border-zinc-200 bg-muted/40 px-5 py-2.5">
              <div className="col-span-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Invoice
              </div>
              <div className="col-span-3 hidden text-xs font-semibold uppercase tracking-wide text-muted-foreground md:block">
                Customer
              </div>
              <div className="col-span-2 hidden text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:block">
                Date
              </div>
              <div className="col-span-2 hidden text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:block">
                Due
              </div>
              <div className="col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Status
              </div>
              <div className="col-span-2 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:col-span-1">
                Amount
              </div>
            </div>

            <div className="divide-y divide-zinc-200">
              {filtered.map((inv) => (
                <Link
                  key={inv.id}
                  to={`/invoices/${inv.id}`}
                  className="group grid grid-cols-12 items-center px-5 py-3.5 transition-colors hover:bg-muted/30"
                >
                  {/* Invoice number */}
                  <div className="col-span-3 flex items-center gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-muted/80">
                      <FileText size={12} className="text-muted-foreground" />
                    </div>
                    <span className="font-mono text-sm font-medium text-foreground">
                      {inv.invoice_number}
                    </span>
                  </div>

                  {/* Customer */}
                  <div className="col-span-3 hidden md:block">
                    <p className="truncate text-sm text-foreground/80">
                      {inv.customer?.name ?? `#${inv.customer_id}`}
                    </p>
                  </div>

                  {/* Created date */}
                  <div className="col-span-2 hidden lg:block">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(inv.created_at)}
                    </p>
                  </div>

                  {/* Due date */}
                  <div className="col-span-2 hidden lg:block">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(inv.due_date)}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <StatusBadge
                      status={(inv.status ?? "draft") as InvoiceStatus}
                    />
                  </div>

                  {/* Amount + arrow */}
                  <div className="col-span-2 lg:col-span-1 flex items-center justify-end gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(inv.total)}
                    </p>
                    <ArrowRight
                      size={13}
                      className="hidden text-muted-foreground transition-colors group-hover:text-foreground lg:block"
                    />
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-end border-t border-zinc-200 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
              </p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
