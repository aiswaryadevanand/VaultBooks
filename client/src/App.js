import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { loadStoredCredentials } from "./redux/slices/authSlice";

// Public Pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordToken from "./pages/ResetPasswordToken";

// Protected Pages
import WalletListPage from "./pages/WalletListPage"; 
import Wallets from "./pages/Wallets"; 
import Reminder from "./pages/Reminder";
import Profile from "./pages/Profile";
import ResetPassword from "./pages/ResetPassword";


// Dashboard Layout and Inner Pages
import DashboardLayout from "./pages/Dashboard";
import DashboardHome from "./pages/DashboardHome";
import Transactions from "./pages/TransactionsPage";
import Budget from "./pages/Budget";
import Reports from "./pages/Reports";
import AuditLogs from "./pages/AuditLogs";
import Team from "./pages/Team";
import InviteUser from "./pages/InviteUser";

import PrivateRoute from "./routes/PrivateRoute";

function App() {
const dispatch = useDispatch();

useEffect(() => {
dispatch(loadStoredCredentials());
}, [dispatch]);

return (
<Router>
<Routes>
{/* Public Routes */}
<Route path="/" element={<Navigate to="/login" />} />
<Route path="/register" element={<Register />} />
<Route path="/login" element={<Login />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPasswordToken />} />

    {/* Default Authenticated Landing: Wallet List Page */}
    <Route
      path="/wallets-list"
      element={
        <PrivateRoute>
          <WalletListPage />
        </PrivateRoute>
      }
    />

    {/* Wallet Creation Page — must come before /wallets/:walletId */}
    <Route
      path="/wallets/create"
      element={
        <PrivateRoute>
          <Wallets />
        </PrivateRoute>
      }
    />
<Route
  path="/profile"
  element={
    <PrivateRoute>
      <Profile />
    </PrivateRoute>
  }
/>

<Route
  path="/reset-password"
  element={
    <PrivateRoute>
      <ResetPassword />
    </PrivateRoute>
  }
/>


    {/* Wallet-Specific Dashboard */}
    <Route
      path="/wallets/:walletId"
      element={
        <PrivateRoute>
          <DashboardLayout />
        </PrivateRoute>
      }
    >
      <Route index element={<DashboardHome />} />
      <Route path="transactions" element={<Transactions />} />
      <Route path="budgets" element={<Budget />} />
      <Route path="reminders" element={<Reminder />} />
      <Route path="reports" element={<Reports />} />
      <Route path="audit-logs" element={<AuditLogs />} />
      <Route path="team" element={<Team />} />
      <Route path="team/invite" element={<InviteUser />} />
    </Route>
  </Routes>
</Router>
);
}

export default App;