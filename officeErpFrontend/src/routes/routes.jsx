import React, { useEffect, useState } from "react";
import {
  BankProfit,
  Home,
  LoginPage,
  Members,
  OfficeExpense,
  TransferIncome,
  WaterMaintenance,
  SiteExpense,
  Reports,
  Banks,
  ApiTester,
  FixedAmount,
} from "../views";
import ProtectedRoute from "@/components/components/protected-route";
import path from "path";

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
    path: "/members",
    element: (
      <ProtectedRoute
        element={<Members />}
        requiredPermission={"members.read"}
      />
    ),
  },
  {
    path: "/bank-profit",
    element: (
      <ProtectedRoute
        element={<BankProfit />}
        requiredPermission={"banks.read"}
      />
    ),
  },
  {
    path: "/water-maintenance",
    element: (
      <ProtectedRoute
        element={<WaterMaintenance />}
        requiredPermission={"waterMaintenance.read"}
      />
    ),
  },
  {
    path: "/transfer-income",
    element: (
      <ProtectedRoute
        element={<TransferIncome />}
        requiredPermission={"transferIncome.read"}
      />
    ),
  },
  {
    path: "/office-expense",
    element: (
      <ProtectedRoute
        element={<OfficeExpense />}
        requiredPermission={"officeExpense.read"}
      />
    ),
  },
  {
    path: "/site-expense",
    element: (
      <ProtectedRoute
        element={<SiteExpense />}
        requiredPermission={"siteExpense.read"}
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
    path: "/banks",
    element: (
      <ProtectedRoute element={<Banks />} requiredPermission={"banks.read"} />
    ),
  },
  {
    path: "/api-tester",
    element: <ProtectedRoute element={<ApiTester />} />,
  },
  {
    path: "/fixed-amount",
    element: (
      <ProtectedRoute
        element={<FixedAmount />}
        requiredPermission={"fixedAmount.read"}
      />
    ),
  },
];

export const useRoutes = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    setRoutes(staticRoutes);
  }, []);

  return routes;
};

export default useRoutes;
