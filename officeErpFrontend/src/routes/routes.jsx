import React, { useEffect, useState } from "react";
import { Home, LoginPage, Members } from "../views";

const staticRoutes = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/members",
    element: <Members />,
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
