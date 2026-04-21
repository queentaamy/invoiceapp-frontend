import { type ReactNode } from "react";
import { X } from "lucide-react";
import clsx from "clsx";
import type { InvoiceStatus } from "../../types";

// ── Card ──────────────────────────────────────

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "card",
        hover && "hover:shadow-card-hover transition-shadow duration-200",
        onClick && "cursor-pointer",
        className,
      )}
    >
      {children}
    </div>
  );
}

// ── StatusBadge ───────────────────────────────

const statusMap: Record<InvoiceStatus, { label: string; className: string }> = {
  paid: { label: "Paid", className: "status-paid" },
  unpaid: { label: "Unpaid", className: "status-unpaid" },
  overdue: { label: "Overdue", className: "status-overdue" },
  draft: { label: "Draft", className: "status-draft" },
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  const { label, className } = statusMap[status] ?? statusMap.draft;
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        className,
      )}
    >
      {label}
    </span>
  );
}

// ── Modal ─────────────────────────────────────

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const modalSizes = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="modal-overlay-enter absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(43,49,233,0.12),_transparent_32%),rgba(15,23,42,0.34)] backdrop-blur-md"
        onClick={onClose}
      />
      <div
        className={clsx(
          "modal-panel-enter relative w-full overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.96)_100%)] shadow-[0_32px_80px_rgba(15,23,42,0.22)]",
          modalSizes[size],
        )}
      >
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(43,49,233,0.12),_transparent_70%)]" />
        {title && (
          <div className="relative flex items-center justify-between border-b border-ink-100/80 px-6 pb-4 pt-5">
            <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-full border border-white/80 bg-white/85 p-2 text-ink-400 shadow-sm transition-all hover:-translate-y-px hover:text-ink-700 hover:bg-white"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="relative px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("skeleton", className)} />;
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <Skeleton className="w-8 h-8 rounded-full" />
      <div className="flex-1 flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-1/3" />
        <Skeleton className="h-3 w-1/5" />
      </div>
      <Skeleton className="h-6 w-16" />
    </div>
  );
}

// ── EmptyState ────────────────────────────────

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-ink-100 flex items-center justify-center text-ink-400">
        {icon}
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-semibold text-ink-800">{title}</p>
        {description && (
          <p className="text-sm text-ink-400 max-w-xs">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

// ── StatCard ──────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: { value: string; up: boolean };
  accent?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  accent = "bg-ink-100 text-ink-600",
}: StatCardProps) {
  return (
    <div className="card flex items-start justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-xs text-ink-400 font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-semibold text-ink-900 tracking-tight">
          {value}
        </p>
        {trend && (
          <p
            className={clsx(
              "text-xs font-medium",
              trend.up ? "text-[#2B31E9]" : "text-red-500",
            )}
          >
            {trend.up ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </div>
      <div
        className={clsx(
          "w-10 h-10 rounded-xl flex items-center justify-center",
          accent,
        )}
      >
        {icon}
      </div>
    </div>
  );
}

// ── ConfirmDialog ─────────────────────────────

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  isLoading,
}: ConfirmDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="modal-overlay-enter absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.12),_transparent_30%),rgba(15,23,42,0.46)] backdrop-blur-md"
        onClick={onClose}
      />
      <div className="modal-panel-enter relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,250,252,0.95)_100%)] p-6 shadow-[0_32px_80px_rgba(15,23,42,0.24)]">
        <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.18),_transparent_72%)]" />
        <div className="relative">
          <div className="mb-5 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#fff1f2_0%,#fee2e2_100%)] text-red-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_12px_24px_rgba(239,68,68,0.16)]">
              <X size={20} />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-red-500/80">
                Confirm action
              </p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink-900">
                {title}
              </h3>
            </div>
          </div>
          <div className="rounded-2xl border border-red-100/80 bg-white/80 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
            <p className="text-sm leading-7 text-ink-500">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-medium text-ink-600 transition-all hover:-translate-y-px hover:border-ink-300 hover:text-ink-900"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-2xl bg-[linear-gradient(135deg,#ef4444_0%,#dc2626_100%)] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(220,38,38,0.28)] transition-all hover:-translate-y-px hover:brightness-105 disabled:opacity-60"
          >
            {isLoading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
