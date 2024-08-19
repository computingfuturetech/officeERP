import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '../components/sidebar';
import { checkTokenExpiration } from '../features/auth/authSlice';
import AllMemberList from '../components/all_member_list';
import SellerDetails from '../components/seller_details';
import WaterMaintainanceComponent from '../components/waterMaintainanceComponent';
import WaterMaintainanceForm from '../components/water-maintanance-form';
import BasicLineChart from '../components/line-chart';
import BasicBars from '../components/bar-char';

export default function WaterMaintainance() {
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
      
    <div className="chart">
        <div className="chart-wrapper">
       <WaterMaintainanceForm></WaterMaintainanceForm>

        </div>
      </div>
        <div className="main-content">


           <WaterMaintainanceComponent/>
        

        </div>
        {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
      </div>
    </>
  )
}
