import React, { useEffect, useState } from "react";
import { BankProfit, Home, LoginPage, Members } from "../views";
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
];

export const useRoutes = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    setRoutes(staticRoutes);
  }, []);

  return routes;
};

export default useRoutes;
