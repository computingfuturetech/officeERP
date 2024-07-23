import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { checkTokenExpiration } from "../features/auth/authSlice";
import Sidebar from "../components/sidebar";
import AllMemberList from "../components/all_member_list";
export default function Members() {
  const dispatch = useDispatch();
  const isLoading = useSelector((state) => state.auth.isLoading);
  useEffect(() => {
    const checkToken = () => {
      dispatch(checkTokenExpiration());
    };
    checkToken();
  }, [dispatch]);

  return (
    <>
      <Sidebar />
      <div className={`main ${isLoading ? "loading" : ""}`}>
        <div className="main-content">
            <AllMemberList />
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
