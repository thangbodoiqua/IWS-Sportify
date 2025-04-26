import React from 'react';
import { Routes, Route} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Home from './pages/Home';
import Login from './pages/Login';
import EmailVerify from './pages/EmailVerify';
import ResetPassword from './pages/ResetPassword';
import AccountPage from './pages/AccountPage';
import AdminDashboard from './pages/AdminDashBoard';

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path='/' element= {<Home/>}/>
        <Route path='/login' element={<Login />} />
        <Route path='/email-verify' element={<EmailVerify />} /> 
        <Route path='/reset-password' element={<ResetPassword />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/account' element={<AccountPage />} />
      </Routes>
    </div>
  )
}

export default App