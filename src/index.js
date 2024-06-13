import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login';
import SignUp from './SignUp';
import Main from './Mainpage';
import GuestLogin from './guestLogin';
import AboutUs from './AboutUs';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter> 
    <Routes>
      <Route path = "/" element={<Login />} />
      <Route path = "/signup" element={<SignUp />} />
      <Route path = "/main" element={<Main />} />
      <Route path = "/guestmain" element={<GuestLogin />} />
      <Route path = "/aboutus" element={<AboutUs />} />
    </Routes>
  </BrowserRouter>, 
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();