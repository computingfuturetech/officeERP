import Sidebar from '../components/sidebar'
import React from 'react'
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from 'react'
import { checkTokenExpiration, logout } from '../features/auth/authSlice'
import OfficeExpenseComponent from '../components/officeExpenseComponent';
import BasicLineChart from '../components/line-chart';
import BasicBars from '../components/bar-char';


export default function OfficeExpense() {
    const dispatch = useDispatch();
    // const token = useSelector((state) => state.auth.token)
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
     
      <div className="chart">
        <div className="chart-wrapper">
        <BasicLineChart/>
        <BasicBars/>

        </div>
      </div>
      <div className="main-content display-flex">
       <OfficeExpenseComponent/>
       
      </div>
      
    
  </div>
  </>
  )
}
