import React from 'react';
import { Routes, Route} from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthCallBack from './pages/AuthCallBack';
import Home from './pages/Home';
import Login from './pages/Login';

const App = () => {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path='/' element= {<Home/>}/>
        <Route path='/login' element={<Login />} />
        <Route path='/auth-callback' element={<AuthCallBack />} />
      </Routes>
    </div>
  )
}

export default App