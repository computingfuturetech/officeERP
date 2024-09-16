import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '../components/sidebar';
import { checkTokenExpiration } from '../features/auth/authSlice';
import BasicBars from '../components/bar-char';
import BasicLineChart from '../components/line-chart';
import ReportsComponent from '../components/reports-component';

function Reports() {
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
    <Sidebar></Sidebar>
    <div className={`main ${isLoading ? "loading" : ""}`}>
     
      {/* <div className="chart">
        <div className="chart-wrapper">
        <BasicLineChart/>
        <BasicBars/>

        </div>
      </div> */}
      <div className='main-content'>
      <div className="member-list">
      
       <ReportsComponent/>
      </div>
      </div>
      
    
  </div>
    

    </>
  )
}

export default Reports
