import { lazy } from "react";

const Home = lazy(() => import("./Home"));
const LoginPage = lazy(() => import("./LoginPage"));
const Members = lazy(() => import("./Members"));
export { Home, LoginPage, Members };
