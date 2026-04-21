import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Link, useLocation } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { ChevronRightIcon } from "lucide-react";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const { pathname } = useLocation();

  function isItemActive(item: { url: string; items?: { url: string }[] }) {
    return (
      pathname === item.url ||
      pathname.startsWith(`${item.url}/`) ||
      item.items?.some(
        (subItem) =>
          pathname === subItem.url || pathname.startsWith(`${subItem.url}/`),
      )
    );
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const hasSubItems = !!item.items?.length;

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive || isItemActive(item)}
            >
              <SidebarMenuItem>
                {hasSubItems ? (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isItemActive(item)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  <SidebarMenuButton asChild isActive={isItemActive(item)}>
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
                {hasSubItems ? (
                  <>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuAction className="data-[state=open]:rotate-90">
                        <ChevronRightIcon />
                        <span className="sr-only">Toggle</span>
                      </SidebarMenuAction>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items?.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={
                                pathname === subItem.url ||
                                pathname.startsWith(`${subItem.url}/`)
                              }
                            >
                              <Link to={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </>
                ) : null}
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
