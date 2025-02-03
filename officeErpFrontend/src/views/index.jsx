import { lazy } from "react";

const Home = lazy(() => import("./Home"));
const LoginPage = lazy(() => import("./LoginPage"));
const Members = lazy(() => import("./Members"));
const BankProfit = lazy(() => import("./BankProfit"));
const WaterMaintenance = lazy(() => import("./WaterMaintenance"));
const TransferIncome = lazy(() => import("./TransferIncome"));
export {
  Home,
  LoginPage,
  Members,
  BankProfit,
  WaterMaintenance,
  TransferIncome,
};
