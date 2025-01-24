import React from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url?: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url?: string;
      icon?: LucideIcon;
      items?: {
        title: string;
        url: string;
        icon?: LucideIcon;
      }[];
    }[];
  }[];
}) {
  const location = useLocation(); // Get the current route

  const renderItems = (menuItems: any[]) => {
    return menuItems.map((item) =>
      item.items ? (
        <Collapsible
          key={item.title}
          asChild
          defaultOpen={item.isActive || item.items.some((subItem: any) => subItem.url === location.pathname)}
          className="group/collapsible"
        >
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon className="mr-2" />}
                <span>{item.title}</span>
                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>{renderItems(item.items)}</SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      ) : (
        <Link to={item.url} key={item.title}>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={item.title}
              className={`${location.pathname === item.url
                ? "bg-black text-white hover:bg-gray-900 hover:text-white transition-transform duration-200"
                : ""
                }`}
            >
              {item.icon && <item.icon className="mr-2" />}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </Link>
      )
    );
  };

  return (
    <SidebarGroup>
      <SidebarMenu>{renderItems(items)}</SidebarMenu>
    </SidebarGroup>
  );
}
