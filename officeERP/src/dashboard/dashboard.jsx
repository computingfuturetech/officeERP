import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { checkTokenExpiration } from "../features/auth/authSlice";
import "./style/dashboardStyle.css";
import Sidebar from "../components/sidebar";
import { logout } from "../features/auth/authSlice";
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
        <div className="top-nav">
          <a href="#" onClick={() => dispatch(logout())}>
            Logout
          </a>
        </div>
        <div className="top-content-container">
          <div className="invoice">
            <h3>Invoice</h3>
            <div className="data">
              <p>This month</p>
              <span>$ 123.00</span>
            </div>
          </div>
          <div className="invoice">
            <h3>Invoice</h3>
            <div className="data">
              <p>This month</p>
              <span>$ 123.00</span>
            </div>
          </div>
        </div>
        <div className="dashboard-content-container">
          <div className="member-list">
            <h2>Members</h2>
            <div className="member">
              <div className="member">
                <div className="member-image"></div>
                <div className="member-info">
                  <h3>John Doe</h3>
                  <p>
                    <span>Member since</span>
                    <span>01/01/2021</span>
                  </p>
                </div>
              </div>
              <div className="member">
                <div className="member-image"></div>
                <div className="member-info">
                  <h3>John Doe</h3>
                  <p>
                    <span>Member since</span>
                    <span>01/01/2021</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="daily-transaction-container"></div>
          <div className="last-reports"></div>
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
