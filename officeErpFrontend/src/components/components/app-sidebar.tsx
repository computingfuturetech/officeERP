import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  ChevronRight,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PanelTopClose,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"

import { NavMain } from "@/components/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/components/ui/sidebar"
import images from "../../assets"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: GalleryVerticalEnd,
    },
    {
      title: "Members",
      url: "/members",
      icon: AudioWaveform,
    },
    {
      title: "Income",
      icon: Command,
      items: [
        { title: "Transfer Income", url: "#", icon: ChevronRight },
        { title: "Bank Profit", url: "#", icon: ChevronRight },
        { title: "Water/Maintenance", url: "#", icon: ChevronRight },
        { title: "Possession", url: "#", icon: ChevronRight },
      ],
    },
    {
      title: "Expense",
      icon: Frame,
      items: [
        { title: "Office Expense", url: "#", icon: ChevronRight },
        { title: "Site Expense", url: "#", icon: ChevronRight },
      ],
    },
    {
      title: "Reports",
      icon: PieChart,
      items: [
        {
          title: "Transaction Report",
          icon: Map,
          items: [
            { title: "Profit", url: "#", icon: ChevronRight },
            { title: "Loss", url: "#", icon: ChevronRight },
          ],
        },
      ],
    },
  ],
  logout: [{
    title: "Logout",
    url: "/login",
    icon: PanelTopClose,
  }],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-center h-16 m-4">
        <img src={images.logo} alt="" className="w-16" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavMain items={data.logout} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
