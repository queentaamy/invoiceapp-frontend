import { type ReactNode, useEffect, useRef, useState } from "react";
import { BellIcon, X } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useNotification } from "@/context/NotificationContext";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbParent?: string;
  actions?: ReactNode;
}

export function Layout({
  children,
  title,
  breadcrumbParent = "InvoiceFlow",
  actions,
}: LayoutProps) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { notifications, clearAll } = useNotification();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex min-h-16 shrink-0 items-center border-b bg-background/95 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex w-full flex-wrap items-center justify-between gap-2 px-3 sm:px-4 md:px-6">
            <div className="reveal-soft min-w-0 flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">{breadcrumbParent}</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{title ?? "Overview"}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="reveal-soft relative ml-auto flex items-center gap-2" ref={panelRef}>
              {actions}
              <button
                type="button"
                aria-label="Notifications"
                aria-expanded={isNotificationsOpen}
                onClick={() => setIsNotificationsOpen((prev) => !prev)}
                className="relative inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
              >
                <BellIcon className="size-4" />
                {notifications.length > 0 ? (
                  <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-[#2B31E9]" />
                ) : null}
              </button>
              {isNotificationsOpen ? (
                <div className="reveal-soft absolute right-0 top-10 z-50 w-[min(22rem,calc(100vw-1rem))] overflow-hidden rounded-2xl border border-border bg-background shadow-xl">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-ink-900">
                        Notifications
                      </p>
                      <p className="text-xs text-ink-400">
                        {notifications.length === 0
                          ? "No notifications right now"
                          : `${notifications.length} active notification${notifications.length === 1 ? "" : "s"}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Close notifications"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto p-2">
                    {notifications.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-ink-400">
                        Notifications will appear here.
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="mb-2 rounded-xl border border-border bg-surface-muted px-3 py-3 last:mb-0"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-ink-900">
                                {notification.title}
                              </p>
                              {notification.message ? (
                                <p className="mt-1 text-xs leading-relaxed text-ink-500">
                                  {notification.message}
                                </p>
                              ) : null}
                            </div>
                            <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-400">
                              {notification.type}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 ? (
                    <div className="border-t p-3">
                      <button
                        type="button"
                        onClick={clearAll}
                        className="w-full rounded-lg border border-border px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-muted"
                      >
                        Clear all
                      </button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="page-enter stagger-children flex flex-1 flex-col gap-4 p-3 pt-0 sm:p-4 sm:pt-0 md:p-6 md:pt-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
