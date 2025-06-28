
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch,useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

import {
  FaTachometerAlt, FaWallet, FaExchangeAlt, 
  FaFileAlt, FaScroll, FaUsers, FaSignOutAlt,FaChartPie, FaBell
} from 'react-icons/fa';

const DashboardLayout = () => {
  const { selectedWallet } = useSelector((state) => state.wallets);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const walletId = selectedWallet?._id;

const navItems = walletId ? [
  { label: 'Dashboard', icon: <FaTachometerAlt />, path: `/wallets/${walletId}/dashboard` },
  { label: 'Transactions', icon: <FaExchangeAlt />, path: `/wallets/${walletId}/transactions` },
  { label: 'Budgets', icon: <FaChartPie />, path: `/wallets/${walletId}/budgets` },
  { label: 'Reminders', icon: <FaBell />, path: `/wallets/${walletId}/reminders` },
  { label: 'Reports', icon: <FaFileAlt />, path: `/wallets/${walletId}/reports` },
  { label: 'Audit Logs', icon: <FaScroll />, path: `/wallets/${walletId}/audit-logs` },
  { label: 'Team', icon: <FaUsers />, path: `/wallets/${walletId}/team` }
] : [];


  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Left Sidebar */}
      <div className="w-64 bg-gray-100 text-black flex flex-col justify-between border-r border-gray-300 p-6">
        <div>
          <h1 className="text-2xl font-bold mb-8">VaultBooks</h1>
          {navItems.map(({ label, icon, path }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className="flex items-center gap-4 w-full text-left text-black py-2 px-3 rounded hover:bg-gray-200 transition"
            >
              {icon} {label}
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-left text-black py-2 px-3 rounded hover:bg-gray-200 transition"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Right Content */}
      <div className="flex-1 p-8 bg-gray-200 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
