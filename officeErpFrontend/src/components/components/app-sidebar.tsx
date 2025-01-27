import * as React from "react";
import {
  AudioWaveform,
  ChevronRight,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PanelTopClose,
  PieChart,
} from "lucide-react";

import { NavMain } from "@/components/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/components/ui/sidebar";
import images from "../../assets";
import { Button } from "./ui/button";
import { useDispatch } from "react-redux";
import { removeUser } from "../../redux/user/user";
import { useNavigate } from "react-router-dom";

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
  logout: [
    {
      title: "Logout",
      url: "/login",
      icon: PanelTopClose,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(removeUser());
    navigate(data.logout[0].url);
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-center h-16 m-1 my-4 cursor-pointer" onClick={() => navigate("/")}>
        <img src={images.logo} alt="Logo" className="w-16" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-500 hover:text-red-600"
          onClick={handleLogout}
        >
          <PanelTopClose className="mr-2" />
          {data.logout[0].title}
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
