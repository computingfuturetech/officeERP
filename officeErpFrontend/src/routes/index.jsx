import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { useRoutes } from "./routes";
// import ScrollToTop from "src/ScrollToTop";

const LazyRoutes = lazy(() => import("../layout"));

const AppRoutes = () => {
  const routes = useRoutes();

  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen flex justify-center items-center">
          <l-ring size="60" color="coral"></l-ring>
        </div>
      }
    >
      {/* <ScrollToTop /> */}
      <Routes>
        <Route element={<LazyRoutes />}>
          {routes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
