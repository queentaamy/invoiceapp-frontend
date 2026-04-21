import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  DollarSign,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
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

export default function DashboardPage() {
  const { user } = useAuth();
  const { invoices, isLoading: invLoading } = useInvoices();
  const { customers, isLoading: custLoading } = useCustomers();

  const stats = useMemo(() => {
    const unpaid = invoices.filter(
      (i) => i.status === "unpaid" || i.status === "overdue",
    );
    const totalRevenue = invoices
      .filter((i) => i.status === "paid")
      .reduce((s, i) => s + i.total, 0);
    return {
      totalInvoices: invoices.length,
      totalCustomers: customers.length,
      totalRevenue,
      unpaid: unpaid.length,
    };
  }, [invoices, customers]);

  const recentInvoices = invoices.slice(0, 5);
  const isLoading = invLoading || custLoading;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const email = user?.email ?? "there";

  return (
    <Layout
      title="Data Overview"
      breadcrumbParent="Build Your Application"
      actions={
        <Link to="/invoices/new">
          <Button variant="secondary" size="sm" leftIcon={<Plus size={14} />}>
            New Invoice
          </Button>
        </Link>
      }
    >
      <section className="pt-4 space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {greeting},
        </h2>
        <p className="max-w-full break-all text-base font-medium leading-tight text-foreground sm:text-lg">
          {email.replace("@", "\u200b@\u200b")}
        </p>
        <p className="text-sm text-muted-foreground">
          Here's what's happening with your invoices.
        </p>
      </section>

      <section className="grid auto-rows-min gap-4 md:grid-cols-3">
        <Card className="rounded-xl bg-card shadow-none ring-1 ring-zinc-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
              Total Revenue
              <DollarSign className="size-4" />
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

      <Card className="min-h-[70vh] flex-1 rounded-xl bg-card shadow-none ring-1 ring-zinc-200 md:min-h-min">
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
            <div className="divide-y divide-zinc-200">
              {recentInvoices.map((inv) => (
                <Link
                  key={inv.id}
                  to={`/invoices/${inv.id}`}
                  className="group flex items-center justify-between px-4 py-3 transition-colors hover:bg-muted/40 md:px-5"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-muted/60">
                      <FileText size={14} className="text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {inv.invoice_number}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {inv.customer?.name ?? `Customer #${inv.customer_id}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 md:gap-4">
                    <StatusBadge
                      status={(inv.status ?? "draft") as InvoiceStatus}
                    />
                    <p className="hidden text-sm font-semibold text-foreground sm:block">
                      {formatCurrency(inv.total)}
                    </p>
                    <p className="hidden text-xs text-muted-foreground lg:block">
                      {formatDate(inv.created_at)}
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
