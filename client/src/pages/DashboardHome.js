import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DashboardHome = () => {
  const { selectedWallet } = useSelector((state) => state.wallets);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const walletId = selectedWallet?._id;

  useEffect(() => {
    if (!walletId || !token) return;

    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
      try {
        const [budgetRes, reminderRes, txRes] = await Promise.all([
          axios.get(`/api/budgets/${walletId}`, config),
          axios.get(`/api/reminders/${walletId}`, config),
          axios.get(`/api/transactions/wallet/${walletId}`, config),
        ]);
        setBudgets(budgetRes.data || []);
        setReminders(reminderRes.data || []);
        setTransactions(txRes.data || []);
      } catch (err) {
        console.error("Dashboard load error", err);
      }
    };

    fetchData();
  }, [walletId, token]);

  const goToInvitePage = () => {
    navigate(`/wallets/${walletId}/team/invite`);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">📊 Dashboard Overview</h2>
        <button
          onClick={goToInvitePage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          + Invite
        </button>
      </div>

      {/* Budgets */}
      <section className="bg-white p-4 shadow rounded">
        <h3 className="text-xl font-semibold mb-2">Budgets</h3>
        {budgets.length === 0 ? (
          <p className="text-gray-500 text-sm">No budgets set.</p>
        ) : (
          <ul className="space-y-2">
            {budgets.map((b) => (
              <li key={b._id} className="border-b pb-2">
                <strong>{b.category}</strong>: ₹{b.spent} / ₹{b.limit}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Reminders */}
      <section className="bg-white p-4 shadow rounded">
        <h3 className="text-xl font-semibold mb-2">Reminders</h3>
        {reminders.length === 0 ? (
          <p className="text-gray-500 text-sm">No reminders scheduled.</p>
        ) : (
          <ul className="space-y-2">
            {reminders.map((r) => (
              <li key={r._id}>
                {r.description} — due on{" "}
                {new Date(r.dueDate).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Transactions */}
      <section className="bg-white p-4 shadow rounded">
        <h3 className="text-xl font-semibold mb-2">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-sm">No transactions found.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <li key={tx._id}>
                <span className="font-medium">{tx.category}</span> — ₹
                {tx.amount} ({tx.type})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default DashboardHome;
