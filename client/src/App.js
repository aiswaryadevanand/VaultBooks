
import React,{useEffect} from 'react';
import { loadStoredCredentials } from './redux/slices/authSlice';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; 
import DashboardHome from './pages/DashboardHome';     
import Wallets from './pages/Wallets';
import Transactions from './pages/TransactionsPage';
import Budget from './pages/Budget';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Team from './pages/Team';
import Reminder from './pages/Reminder';

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadStoredCredentials()); // ✅ load token and user at startup
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/wallets/:id/budget" element={<Budget />} /> */}
        <Route path="/wallets/:id/reminders" element={<Reminder/>} />

        {/* Dashboard layout with nested content */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHome />} /> 
          <Route path="wallets" element={<Wallets />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="wallets/:id/budgets" element={<Budget />} />
          
          <Route path="reports" element={<Reports />} />
          <Route path="audit-logs" element={<AuditLogs />} />
          <Route path="team" element={<Team />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
