import React, { useEffect, useState } from "react";
import {
  Home,
  LoginPage,
  StaffUsers,
  MemberPlotRecords,
  ChartOfAccounts,
  Vouchers,
  Reports,
  ApiTester,
} from "../views";
import ProtectedRoute from "@/components/components/protected-route";

const staticRoutes = [
  {
    path: "/",
    element: (
      <ProtectedRoute element={<Home />} requiredPermission={"dasboard.read"} />
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/member-plot-records",
    element: (
      <ProtectedRoute
        element={<MemberPlotRecords />}
        requiredPermission={"memberPlotRecords.read"}
      />
    ),
  },
  {
    path: "/staff-users",
    element: (
      <ProtectedRoute
        element={<StaffUsers />}
        requiredPermission={"staffUsers.read"}
      />
    ),
  },
  {
    path: "/chart-of-accounts",
    element: (
      <ProtectedRoute
        element={<ChartOfAccounts />}
        requiredPermission={"chartOfAccounts.read"}
      />
    ),
  },
  {
    path: "/vouchers",
    element: (
      <ProtectedRoute
        element={<Vouchers />}
        requiredPermission={"vouchers.read"}
      />
    ),
  },
  {
    path: "/reports",
    element: (
      <ProtectedRoute
        element={<Reports />}
        requiredPermission={"reports.read"}
      />
    ),
  },
  {
    path: "/api-tester",
    element: (
      <ProtectedRoute
        element={<ApiTester />}
        requiredPermission={"apiTester.read"}
      />
    ),
  },
];

export const useRoutes = () => {
  const [routes, setRoutes] = useState(staticRoutes);
  return routes;
};

export default useRoutes;
