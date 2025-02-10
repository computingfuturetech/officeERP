import { lazy } from "react";

const Home = lazy(() => import("./Home"));
const LoginPage = lazy(() => import("./LoginPage"));
const Members = lazy(() => import("./Members"));
const Banks = lazy(() => import("./Banks"));
const BankProfit = lazy(() => import("./BankProfit"));
const WaterMaintenance = lazy(() => import("./WaterMaintenance"));
const TransferIncome = lazy(() => import("./TransferIncome"));
const OfficeExpense = lazy(() => import("./OfficeExpense"));
const SiteExpense = lazy(() => import("./SiteExpense"));
const Reports = lazy(() => import("./Reports"));
const ApiTester = lazy(() => import("./ApiTester"));
export {
  Home,
  LoginPage,
  Members,
  Banks,
  BankProfit,
  WaterMaintenance,
  TransferIncome,
  OfficeExpense,
  SiteExpense,
  Reports,
  ApiTester,
};
