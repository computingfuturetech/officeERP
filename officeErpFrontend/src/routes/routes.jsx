import React, { useEffect, useState } from "react";
import {
  BankProfit,
  Home,
  LoginPage,
  Members,
  TransferIncome,
  WaterMaintenance,
} from "../views";
import ProtectedRoute from "@/components/components/protected-route";
import path from "path";

const staticRoutes = [
  {
    path: "/",
    element: <ProtectedRoute element={<Home />} />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/members",
    element: <ProtectedRoute element={<Members />} />,
  },
  {
    path: "/bank-profit",
    element: <ProtectedRoute element={<BankProfit />} />,
  },
  {
    path: "/water-maintenance",
    element: <ProtectedRoute element={<WaterMaintenance />} />,
  },
  {
    path: "/transfer-income",
    element: <ProtectedRoute element={<TransferIncome />} />,
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
