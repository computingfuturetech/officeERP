import { lazy } from "react";

const Home = lazy(() => import("./Home"));
const LoginPage = lazy(() => import("./LoginPage"));
const StaffUsers = lazy(() => import("./StaffUsers"));
const MemberPlotRecords = lazy(() => import("./MemberPlotRecords"));
const ChartOfAccounts = lazy(() => import("./ChartOfAccounts"));
const Vouchers = lazy(() => import("./Vouchers"));
const Reports = lazy(() => import("./Reports"));
const ApiTester = lazy(() => import("./ApiTester"));

export {
  Home,
  LoginPage,
  StaffUsers,
  MemberPlotRecords,
  ChartOfAccounts,
  Vouchers,
  Reports,
  ApiTester,
};
