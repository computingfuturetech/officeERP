import './App.css'
import Auth from './auth/auth'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Dashboard from './dashboard/dashboard'
import Dummy2 from './dashboard/dummy2'
import Dummy3 from './dashboard/dummy3'
import Dummy4 from './dashboard/dummy4'
import Dummy5 from './dashboard/dummy5'
import Dummy6 from './dashboard/dummy6'
import Loading from './components/loading'
import Members from './members/members'
import BankProfit from './income/bank-profit'
import Seller from './general/seller'
import Purchaser from './general/purchaser'
import OfficeExpense from './expense/office-expense'
import SiteExpense from './expense/site-expense'

function App() {
  

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Loading/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/login" element={<Auth  isLogin={true}/>} />
          <Route path="/otp" element={<Auth  isOTP={true}/>} />
          <Route path="/new-password" element={<Auth  isNewPassword={true}/>} />
          <Route path="/forgot-password" element={<Auth  isForgotPassword={true}/>}/>
          <Route path="/members" element={<Members/>}/>
          <Route path="/income/bank-profit" element={<BankProfit/>}/>
          <Route path="/expense/office-expense" element={<OfficeExpense/>}/>
          <Route path="/expense/site-expense" element={<SiteExpense/>}/>
          <Route path="/income/seller" element={<Seller/>}/>
          <Route path="/income/purchaser" element={<Purchaser/>}/>
          <Route path="/dummy3" element={<Dummy2/>}/>
          <Route path="/dummy4" element={<Dummy3/>}/>
          <Route path="/dummy5" element={<Dummy4/>}/>
          <Route path="/dummy6" element={<Dummy5/>}/>
          <Route path="/dummy7" element={<Dummy6/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
