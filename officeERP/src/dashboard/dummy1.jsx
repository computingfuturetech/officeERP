import React  from 'react'
import Sidebar from '../components/sidebar'
import MemberList from '../components/member_list'
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from 'react'
import { checkTokenExpiration, logout } from '../features/auth/authSlice'

export default function Dummy1() {
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
        <div className="top-nav">
          <a href="#" onClick={() => dispatch(logout())}>
            Logout
          </a>
        </div>
        <div className="main-content">
        <MemberList/>
        </div>
      
    </div>
    </>
  )
}
