import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { checkTokenExpiration } from "../features/auth/authSlice";
import "./style/dashboardStyle.css";
import Sidebar from "../components/sidebar";
import { logout } from "../features/auth/authSlice";
import Invoice from "../components/invoice";
import MemberList from "../components/member_list";
import DailyTransaction from "../components/daily_transaction";
import LastReports from "../components/last_reports";
export default function Dashboard() {
  const dispatch = useDispatch();
  // const token = useSelector((state) => state.auth.token)
  const isLoading = useSelector((state) => state.auth.isLoading);
  useEffect(() => {
    const checkToken = () => {
      console.log("Checking token expiration");
      dispatch(checkTokenExpiration());
    };
    checkToken();
  }, [dispatch]);

  return (
    <>
      <Sidebar />
      <div className={`main ${isLoading ? "loading" : ""}`}>
        {/* <div className="top-nav">
          <a href="#" onClick={() => dispatch(logout())}>
            Logout
          </a>
        </div> */}
        <div className="top-content-container">
          <Invoice name={'Invoice'} desc={'This month'} price={'$ 123.00'}/>
          <Invoice name={'Invoice'} desc={'This month'} price={'$ 123.00'}/>
        </div>
        <div className="dashboard-content">
          <div className="dashboard-content-container ">
           <MemberList/>
            <div className="recent-activities">
             <DailyTransaction/>
              <LastReports/>
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </>
  );
}
