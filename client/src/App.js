import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login'; // 🔹 import login
import Wallets from './pages/Wallets';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} /> {/* 🔹 add this */}
        <Route path="/wallets" element={<Wallets />} />
      </Routes>
    </Router>
  );
}

export default App;
