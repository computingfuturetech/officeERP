import React from 'react'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { checkTokenExpiration } from "../features/auth/authSlice"



export default function Loading() {
    const dispatch = useDispatch();
    useEffect(() => {
        const checkToken = () => {
          dispatch(checkTokenExpiration());
        };
        checkToken();
      }, [dispatch]);
  return (
    <div className='container loading'>
         <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
    </div>
  )
}
