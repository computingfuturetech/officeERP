import React, { useEffect, useState } from "react";
import { Home, LoginPage, Members } from "../views";
import ProtectedRoute from "@/components/components/protected-route";

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
];

export const useRoutes = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    setRoutes(staticRoutes);
  }, []);

  return routes;
};

export default useRoutes;
