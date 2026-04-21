"use client";

import * as React from "react";
import {
  Clock3,
  FileText,
  HelpCircle,
  LayoutDashboard,
  Mail,
  PlusCircle,
  Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { AppLogo } from "@/components/ui/AppLogo";
import { useAuth } from "@/context/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Invoices",
      url: "/invoices",
      icon: FileText,
      items: [
        {
          title: "All Invoices",
          url: "/invoices",
        },
        {
          title: "New Invoice",
          url: "/invoices/new",
        },
      ],
    },
    {
      title: "Customers",
      url: "/customers",
      icon: Users,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "mailto:appiahasantewaa7@gmail.com",
      icon: HelpCircle,
    },
    {
      title: "Feedback",
      url: "mailto:appiahasantewaa7@gmail.com",
      icon: Mail,
    },
  ],
  projects: [
    {
      name: "New Invoice",
      url: "/invoices/new",
      icon: PlusCircle,
    },
    {
      name: "Open Invoices",
      url: "/invoices",
      icon: Clock3,
    },
    {
      name: "Customer List",
      url: "/customers",
      icon: Users,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <AppLogo size={32} className="rounded-none" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">InvoiceFlow</span>
                  <span className="truncate text-xs">Billing Suite</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.name ?? "User",
            email: user?.email ?? "",
            avatar: "/app-icon.png",
          }}
          onLogout={handleLogout}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
