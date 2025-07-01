import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

import {
  FaTachometerAlt,
  FaExchangeAlt,
  FaChartPie,
  FaBell,
  FaFileAlt,
  FaScroll,
  FaUsers,
  FaSignOutAlt
} from 'react-icons/fa';

const DashboardLayout = () => {
  const { selectedWallet, userRole } = useSelector((state) => state.wallets);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const walletId = selectedWallet?._id;

  const navItems = walletId
    ? [
        { label: 'Dashboard', icon: <FaTachometerAlt />, path: `/wallets/${walletId}` },
        { label: 'Transactions', icon: <FaExchangeAlt />, path: `/wallets/${walletId}/transactions` },
        { label: 'Budgets', icon: <FaChartPie />, path: `/wallets/${walletId}/budgets` },
        { label: 'Reminders', icon: <FaBell />, path: `/wallets/${walletId}/reminders` },
        { label: 'Reports', icon: <FaFileAlt />, path: `/wallets/${walletId}/reports` },
        { label: 'Audit Logs', icon: <FaScroll />, path: `/wallets/${walletId}/audit-logs` },
        { label: 'Team', icon: <FaUsers />, path: `/wallets/${walletId}/team` }
      ]
    : [];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 text-black flex flex-col justify-between border-r border-gray-300 p-6">
        <div>
          <h1 className="text-3xl font-extrabold text-blue-700 mb-10 tracking-wide">VaultBooks</h1>

          {navItems.map(({ label, icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`flex items-center gap-4 w-full text-left py-2 px-3 rounded transition ${
                  isActive ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-200 text-black'
                }`}
              >
                {icon} {label}
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-left text-red-600 py-2 px-3 rounded hover:bg-red-100 transition"
        >
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 bg-gray-100 overflow-auto">
        {walletId && (
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/wallets-list")}
                className="text-blue-600 hover:underline text-sm"
              >
                ← Back to Wallets
              </button>
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                💼 {selectedWallet.name}
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${
                    userRole === "owner"
                      ? "bg-green-100 text-green-700"
                      : userRole === "editor"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {userRole}
                </span>
              </h2>
            </div>

            {userRole === "owner" && (
              <button
                onClick={() => navigate(`/wallets/${walletId}/team/invite`)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                + Invite
              </button>
            )}
          </div>
        )}

        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
