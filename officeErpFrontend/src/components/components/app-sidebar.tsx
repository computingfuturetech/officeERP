import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeUser } from "../../redux/user/user";
import {
  LayoutDashboard,
  Users,
  Building2Icon,
  Frame,
  Banknote,
  HandCoins,
  Landmark,
  Droplet,
  CircleDollarSign,
  Building,
  Factory,
  ChartNoAxesCombined,
  PanelTopClose,
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

const data = {
  navMain: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard, permission: "dasboard.read" },
    { title: "Members", url: "/members", icon: Users, permission: "members.read" },
    { title: "Banks", url: "/banks", icon: Building2Icon, permission: "banks.read" },
    { title: "Fixed Amount", url: "/fixed-amount", icon: Frame, permission: "fixedAmount.read" },
    { title: "Staff Users", url: "/staff-users", icon: Users, permission: "staffUsers.read" },
    {
      title: "Income",
      icon: Banknote,
      items: [
        { title: "Transfer Income", url: "/transfer-income", icon: HandCoins, permission: "transferIncome.read" },
        { title: "Bank Profit", url: "/bank-profit", icon: Landmark, permission: "bankProfit.read" },
        { title: "Water/Maintenance", url: "/water-maintenance", icon: Droplet, permission: "waterMaintenance.read" },
      ],
    },
    {
      title: "Expense",
      icon: CircleDollarSign,
      items: [
        { title: "Office Expense", url: "/office-expense", icon: Building, permission: "officeExpense.read" },
        { title: "Site Expense", url: "/site-expense", icon: Factory, permission: "siteExpense.read" },
      ],
    },
    { title: "Reports", icon: ChartNoAxesCombined, url: "/reports", permission: "reports.read" },
  ],
  logout: [{ title: "Logout", url: "/login", icon: PanelTopClose }],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const permissions = useSelector((state: any) => state?.user?.permissions);

  const handleLogout = () => {
    dispatch(removeUser());
    navigate(data.logout[0].url);
  };

  const hasReadPermission = (permission: string) => {
    if (!permission) return true;
    const [module, action] = permission.split(".");
    return permissions?.[module]?.[action] ?? false;
  };

  const filteredNavMain = data.navMain
    .map((item) => ({
      ...item,
      items: item.items?.filter((subItem) => hasReadPermission(subItem.permission)),
    }))
    .filter((item) => hasReadPermission(item.permission) || (item.items && item.items.length > 0));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="flex items-center justify-center h-16 m-1 my-4 cursor-pointer" onClick={() => navigate("/")}>
        <img src={images.logo} alt="Logo" className="w-16" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600" onClick={handleLogout}>
          <PanelTopClose className="mr-2" />
          {data.logout[0].title}
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
