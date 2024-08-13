import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Sidebar from '../components/sidebar';
import { checkTokenExpiration } from '../features/auth/authSlice';
import AllMemberList from '../components/all_member_list';
import SellerDetails from '../components/seller_details';
import PossessionComponent from '../components/possession_component';

export default function Possession() {
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

           <PossessionComponent></PossessionComponent>
        

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
