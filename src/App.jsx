import React, { useEffect, useState } from "react";
import "./css/global.css";
import Login from "./layouts/Login";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./layouts/Dashboard";
import Product from "./layouts/Product";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/product/:id" element={<Product />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
