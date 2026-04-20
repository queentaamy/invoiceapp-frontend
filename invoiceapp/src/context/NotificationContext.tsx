import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Notification } from "../types";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

interface NotificationContextValue {
  notify: (notification: Omit<Notification, "id">) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: "border-[#2B31E9]/20 bg-[#eef0ff] text-[#1d229f]",
  error: "border-red-500/20 bg-red-50 text-red-800",
  warning: "border-amber-500/20 bg-amber-50 text-amber-800",
  info: "border-blue-500/20 bg-blue-50 text-blue-800",
};

const iconStyles = {
  success: "text-[#2B31E9]",
  error: "text-red-500",
  warning: "text-amber-500",
  info: "text-blue-500",
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const full: Notification = { ...notification, id };
      setNotifications((prev) => [...prev, full]);
      setTimeout(() => dismiss(id), notification.duration ?? 4000);
    },
    [dismiss],
  );

  const success = useCallback(
    (title: string, message?: string) =>
      notify({ type: "success", title, message }),
    [notify],
  );
  const error = useCallback(
    (title: string, message?: string) =>
      notify({ type: "error", title, message }),
    [notify],
  );
  const warning = useCallback(
    (title: string, message?: string) =>
      notify({ type: "warning", title, message }),
    [notify],
  );
  const info = useCallback(
    (title: string, message?: string) =>
      notify({ type: "info", title, message }),
    [notify],
  );

  return (
    <NotificationContext.Provider
      value={{ notify, success, error, warning, info }}
    >
      {children}

      {/* Toast Stack */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 pointer-events-none">
        {notifications.map((n) => {
          const Icon = icons[n.type];
          return (
            <div
              key={n.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-float animate-slide-in-right ${styles[n.type]}`}
            >
              <Icon
                size={18}
                className={`mt-0.5 shrink-0 ${iconStyles[n.type]}`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight">{n.title}</p>
                {n.message && (
                  <p className="text-xs mt-0.5 opacity-80 leading-relaxed">
                    {n.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => dismiss(n.id)}
                className="shrink-0 opacity-50 hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotification must be used inside NotificationProvider");
  return ctx;
}
