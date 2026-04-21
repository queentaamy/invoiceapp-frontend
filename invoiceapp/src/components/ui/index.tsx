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
        className="modal-overlay-enter absolute inset-0 bg-transparent backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={clsx(
          "modal-panel-enter relative w-full bg-white rounded-2xl shadow-float",
          modalSizes[size],
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-ink-100">
            <h2 className="text-base font-semibold text-ink-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition-all"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
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
        className="modal-overlay-enter absolute inset-0 bg-transparent backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="modal-panel-enter relative w-full max-w-sm bg-white rounded-2xl shadow-float p-6">
        <h3 className="font-semibold text-ink-900 mb-2">{title}</h3>
        <p className="text-sm text-ink-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-60 transition-colors"
          >
            {isLoading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
