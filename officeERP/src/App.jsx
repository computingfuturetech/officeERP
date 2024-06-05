import './App.css'
import Auth from './auth/auth'


import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Dashboard from './dashboard/dashboard'

function App() {
  

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/login" element={<Auth  isLogin={true}/>} />
          <Route path="/otp" element={<Auth  isOTP={true}/>} />
          <Route path="/new_password" element={<Auth  isNewPassword={true}/>} />
          <Route path="/forgot_password" element={<Auth  isForgotPassword={true}/>}/>

        </Routes>
      </Router>
    </>
  )
}

export default App
