
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import {
  FaTachometerAlt, FaWallet, FaExchangeAlt, FaChartPie,
  FaFileAlt, FaScroll, FaUsers, FaSignOutAlt
} from 'react-icons/fa';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const navItems = [
    { label: 'Dashboard', icon: <FaTachometerAlt />, path: '/dashboard' },
    { label: 'Wallets', icon: <FaWallet />, path: '/dashboard/wallets' },
    { label: 'Transactions', icon: <FaExchangeAlt />, path: '/dashboard/transactions' },
    { label: 'Budgets', icon: <FaChartPie />, path: '/dashboard/budgets' },
    { label: 'Reports', icon: <FaFileAlt />, path: '/dashboard/reports' },
    { label: 'Audit Logs', icon: <FaScroll />, path: '/dashboard/audit-logs' },
    { label: 'Team', icon: <FaUsers />, path: '/dashboard/team' }
  ];

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
