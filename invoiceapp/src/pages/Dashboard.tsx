import { useMemo } from "react";
import { Link } from "react-router-dom";
import { FileText, Users, Clock, Plus, ArrowRight } from "lucide-react";
import { Layout } from "../components/layout/Layout";
import { StatusBadge, SkeletonRow } from "../components/ui/index";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { useInvoices } from "../hooks/useInvoices";
import { useCustomers } from "../hooks/useCustomers";
import { useAuth } from "../context/AuthContext";
import type { InvoiceStatus } from "../types";

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

function toNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1 ? true : value === 0 ? false : null;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") return true;
    if (normalized === "false" || normalized === "0") return false;
  }
  return null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { invoices, isLoading: invLoading } = useInvoices();
  const { customers, isLoading: custLoading } = useCustomers();

  const customerNameById = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  );

  const resolveStatus = (invoice: (typeof invoices)[number]): InvoiceStatus => {
    const raw = (
      invoice.status ?? (invoice as { payment_status?: string }).payment_status
    )
      ?.toString()
      .toLowerCase();

    if (
      raw === "paid" ||
      raw === "unpaid" ||
      raw === "overdue" ||
      raw === "draft"
    ) {
      return raw;
    }

    const paidFlag = toBoolean((invoice as { is_paid?: unknown }).is_paid);
    if (paidFlag === true) {
      return "paid";
    }

    if (paidFlag === false) {
      return "unpaid";
    }

    return "unpaid";
  };

  const resolveTotal = (invoice: (typeof invoices)[number]): number => {
    const total = toNumber(invoice.total);
    if (total > 0) return total;

    const subtotal = toNumber(invoice.subtotal);
    const tax = toNumber(invoice.tax);
    return subtotal + tax;
  };

  const resolveCreatedDate = (invoice: (typeof invoices)[number]) => {
    return (
      invoice.created_at ??
      (invoice as { createdAt?: string }).createdAt ??
      (invoice as { date?: string }).date
    );
  };

  const resolveInvoiceNumber = (invoice: (typeof invoices)[number]) => {
    const rawNumber = invoice.invoice_number?.toString().trim();
    if (rawNumber) return rawNumber;
    return `INV-${String(invoice.id).padStart(3, "0")}`;
  };

  const stats = useMemo(() => {
    const unpaid = invoices.filter(
      (i) => {
        const status = resolveStatus(i);
        return status === "unpaid" || status === "overdue";
      },
    );
    const totalRevenue = invoices
      .filter((i) => resolveStatus(i) === "paid")
      .reduce((s, i) => s + resolveTotal(i), 0);
    return {
      totalInvoices: invoices.length,
      totalCustomers: customers.length,
      totalRevenue,
      unpaid: unpaid.length,
    };
  }, [invoices, customers]);

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => {
        const left = resolveCreatedDate(a);
        const right = resolveCreatedDate(b);
        const leftTimestamp = left ? new Date(left).getTime() : 0;
        const rightTimestamp = right ? new Date(right).getTime() : 0;

        if (leftTimestamp !== rightTimestamp) {
          return rightTimestamp - leftTimestamp;
        }

        return b.id - a.id;
      })
      .slice(0, 5);
  }, [invoices]);
  const isLoading = invLoading || custLoading;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const displayName = (() => {
    const rawName = user?.name?.trim();
    if (!rawName) return "there";

    const firstName = rawName.split(/\s+/)[0];
    const emailLocalPart = user?.email?.split("@")[0]?.toLowerCase();

    if (emailLocalPart && firstName.toLowerCase() === emailLocalPart) {
      return "there";
    }

    return firstName;
  })();

  return (
    <Layout
      title="Data Overview"
      breadcrumbParent="InvoiceFlow"
      actions={
        <Link to="/invoices/new">
          <Button variant="secondary" size="sm" leftIcon={<Plus size={14} />}>
            New Invoice
          </Button>
        </Link>
      }
    >
      <section className="pt-4 space-y-1">
        <h2 className="max-w-full text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {greeting},{" "}
          <span className="font-medium text-foreground">{displayName}</span>
        </h2>
        <p className="text-sm text-muted-foreground">
          Here's what's happening with your invoices.
        </p>
      </section>

      <section className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card className="rounded-xl bg-card shadow-none ring-1 ring-zinc-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              Total Revenue
              <span className="text-sm font-semibold leading-none text-muted-foreground">
                ₵
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {isLoading ? "—" : formatCurrency(stats.totalRevenue)}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Paid invoices total
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl bg-card shadow-none ring-1 ring-zinc-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              Awaiting Payment
              <Clock className="size-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {isLoading ? "—" : stats.unpaid}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Unpaid and overdue invoices
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl bg-card shadow-none ring-1 ring-zinc-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              Coverage
              <Users className="size-4" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {isLoading
                ? "—"
                : `${stats.totalCustomers} / ${stats.totalInvoices}`}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Customers vs invoices count
            </p>
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden rounded-xl bg-card shadow-none ring-1 ring-zinc-200">
        <CardHeader className="border-b border-zinc-200">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg">Recent Invoices</CardTitle>
            <Link
              to="/invoices"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#2B31E9] hover:text-[#1d229f]"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
        </CardHeader>

        {isLoading ? (
          <CardContent className="divide-y divide-zinc-200">
            {[...Array(5)].map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </CardContent>
        ) : recentInvoices.length === 0 ? (
          <CardContent className="py-16 text-center">
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
            <Link
              to="/invoices/new"
              className="mt-2 inline-block text-sm font-medium text-[#2B31E9] hover:underline"
            >
              Create your first invoice →
            </Link>
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="table-stagger divide-y divide-zinc-200">
              {recentInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  to={`/invoices/${inv.id}`}
                  className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 transition-colors duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-muted/40 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] md:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted/60">
                      <FileText size={14} className="text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {resolveInvoiceNumber(inv)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {inv.customer?.name ??
                          customerNameById.get(inv.customer_id) ??
                          `Customer #${inv.customer_id}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-3 md:gap-4">
                    <StatusBadge
                      status={resolveStatus(inv)}
                    />
                    <p className="text-sm font-semibold text-foreground">
                      {formatCurrency(resolveTotal(inv))}
                    </p>
                    <p className="hidden text-xs text-muted-foreground lg:block">
                      {formatDate(resolveCreatedDate(inv))}
                    </p>
                    <ArrowRight
                      size={14}
                      className="text-muted-foreground transition-colors group-hover:text-foreground"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    </Layout>
  );
}
