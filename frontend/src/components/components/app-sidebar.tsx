import * as React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { removeUser } from "../../redux/user/user";
import {
  LayoutDashboard,
  Users,
  UserRoundMinus,
  Building2,
  Frame,
  Banknote,
  CircleDollarSign,
  FileText,
  Receipt,
  BarChart2,
  LogOut,
} from "lucide-react";
import { NavMain } from "@/components/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/components/ui/sidebar";
import images from "../../assets";
import { Button } from "./ui/button";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard,
      permission: "dasboard.read",
    },
    {
      title: "Staff Users",
      url: "/staff-users",
      icon: Users,
      permission: "staffUsers.read",
    },
    {
      title: "Member Plot Records",
      url: "/member-plot-records",
      icon: Users,
      permission: "memberPlotRecords.read",
    },
    {
      title: "Chart Of Accounts",
      icon: FileText,
      url: "/chart-of-accounts",
    },
    {
      title: "Vouchers",
      icon: Receipt,
      url: "/vouchers",
    },
    {
      title: "Reports",
      icon: BarChart2,
      url: "/reports",
      permission: "reports.read",
    },
  ],
  logout: [{ title: "Logout", url: "/login", icon: LogOut }],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useSidebar();
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
      items: item.items?.filter((subItem) =>
        hasReadPermission(subItem.permission)
      ),
    }))
    .filter(
      (item) =>
        hasReadPermission(item.permission) ||
        (item.items && item.items.length > 0)
    );

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader
        className="flex items-center justify-center h-16 m-1 my-4 cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img src={images.logo} alt="Logo" className="w-16" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <Button
          variant="ghost"
          className={`w-full text-red-500 hover:text-red-600 ${
            state === "collapsed" ? "justify-center px-2" : "justify-start"
          }`}
          onClick={handleLogout}
        >
          <LogOut className={state === "collapsed" ? "" : "mr-2"} />
          {state !== "collapsed" && data.logout[0].title}
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}