
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Budget from './pages/Budget';
// (Create these pages if not already)

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/wallets/:id/budgets" element={<Budget />} />

        {/* Dashboard layout route with nested routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="wallets" element={<Wallets />} />
          
          
         
          {/* Add other child routes as needed */}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
