import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { checkTokenExpiration } from '../features/auth/authSlice'
import './style/dashboardStyle.css'
import Sidebar from '../components/sidebar'
export default function Dashboard() {

    const dispatch = useDispatch()
    // const token = useSelector((state) => state.auth.token)
    const isLoading = useSelector((state) => state.auth.isLoading)
    useEffect(() => {
        const checkToken =  () => {
            console.log('Checking token expiration')
             dispatch(checkTokenExpiration())
        }
        checkToken()
    }, [dispatch])


  return (
    <div className={`main ${isLoading ? "loading" : ""}`}>
        <Sidebar/>
     <div className="container">
      <h1>DASHBOARD</h1>
    </div>
      {isLoading && (
          <div className="loading-indicator">
            <div className="spinner"></div>
          </div>
        )}
    </div>
  )
}
