import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";

const Router = () => {
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/about_us" element={<h1>About Us</h1>} />
        <Route path="/signup" element={<h1>Sign Up</h1>} />
        <Route path="/signin" element={<h1>Sign In</h1>} />
        <Route path="/nyt" element={<h1>NYT</h1>} />
      </Routes>
    </BrowserRouter>
  )

}

export default Router;