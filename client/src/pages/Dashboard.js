import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { getDueReminders } from '../api/reminderAPI';

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

  const [reminderCount, setReminderCount] = useState(0);

  const walletId = selectedWallet?._id;

  useEffect(() => {
    const fetchReminderCount = async () => {
      if (!walletId) return;
      try {
        const res = await getDueReminders(walletId);
        const now = new Date();
        const in7Days = new Date();
        in7Days.setDate(now.getDate() + 7);

        const count = res.data.filter((r) => {
          const due = new Date(r.dueDate);
          return due <= in7Days && r.status !== 'done';
        }).length;

        setReminderCount(count);
      } catch (err) {
        console.error('Failed to fetch reminder count:', err.message);
      }
    };

    fetchReminderCount();
  }, [walletId]);

  const navItems = walletId
    ? [
        { label: 'Dashboard', icon: <FaTachometerAlt />, path: `/wallets/${walletId}` },
        { label: 'Transactions', icon: <FaExchangeAlt />, path: `/wallets/${walletId}/transactions` },
        { label: 'Budgets', icon: <FaChartPie />, path: `/wallets/${walletId}/budgets` },
        { label: 'Reminders', icon: <FaBell />, path: `/wallets/${walletId}/reminders`, badge: reminderCount },
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

          {navItems.map(({ label, icon, path, badge }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={`relative flex items-center justify-between gap-2 w-full text-left py-2 px-3 rounded transition ${
                  isActive ? 'bg-blue-100 text-blue-800 font-semibold' : 'hover:bg-gray-200 text-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  {icon} {label}
                </div>
                {badge > 0 && label === 'Reminders' && (
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {badge}
                  </span>
                )}
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
