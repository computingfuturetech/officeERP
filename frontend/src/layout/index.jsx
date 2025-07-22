import { AppSidebar } from "@/components/components/app-sidebar";
import { SidebarProvider } from "@/components/components/ui/sidebar";
import { Toaster } from "@/components/components/ui/toaster";
import React from "react";
import { Outlet, useLocation } from "react-router-dom";

function Layout() {
  const location = useLocation();
  const isLoginRoute = location.pathname === "/login";

  return (
    <>
      <SidebarProvider>
        {!isLoginRoute && <AppSidebar />}
        <main
          className={`flex flex-col w-full overflow-y-auto ${
            !isLoginRoute ? `p-4` : ``
          }`}
        >
          <Outlet />
        </main>
        <Toaster />
      </SidebarProvider>
    </>
  );
}

export default Layout;
