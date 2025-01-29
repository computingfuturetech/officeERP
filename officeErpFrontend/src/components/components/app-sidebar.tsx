import * as React from "react";
import {
  AudioWaveform,
  Banknote,
  Building,
  ChartNoAxesCombined,
  ChevronRight,
  CircleDollarSign,
  Command,
  Droplet,
  Factory,
  Frame,
  GalleryVerticalEnd,
  HandCoins,
  Landmark,
  LandPlot,
  LayoutDashboard,
  Map,
  PanelTopClose,
  PieChart,
  Users,
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
      icon: LayoutDashboard,
    },
    {
      title: "Members",
      url: "/members",
      icon: Users,
    },
    {
      title: "Income",
      icon: Banknote,
      items: [
        { title: "Transfer Income", url: "#", icon: HandCoins },
        { title: "Bank Profit", url: "/bank-profit", icon: Landmark },
        { title: "Water/Maintenance", url: "/water-maintenance", icon: Droplet },
        { title: "Possession", url: "#", icon: LandPlot },
      ],
    },
    {
      title: "Expense",
      icon: CircleDollarSign,
      items: [
        { title: "Office Expense", url: "#", icon: Building },
        { title: "Site Expense", url: "#", icon: Factory },
      ],
    },
    {
      title: "Reports",
      icon: ChartNoAxesCombined,
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
