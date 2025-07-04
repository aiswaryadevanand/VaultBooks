import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,Cell } from "recharts";
import { CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react";
import { getDueReminders } from "../api/reminderAPI";

const DashboardHome = () => {
  const { selectedWallet, userRole } = useSelector((state) => state.wallets);
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [dueCount, setDueCount] = useState(0);

  const walletId = selectedWallet?._id;

  useEffect(() => {
    if (!walletId || !token) return;

    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchData = async () => {
      try {
        const [budgetRes, reminderRes, txRes, dueReminderRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/budgets/${walletId}`, config),
          axios.get(`http://localhost:5000/api/reminders/${walletId}`, config),
          axios.get(`http://localhost:5000/api/transactions?walletId=${walletId}`, config),
          getDueReminders(walletId),
        ]);

        setBudgets(budgetRes.data || []);
        setReminders(reminderRes.data || []);
        setTransactions(txRes.data || []);

        // Count both overdue and upcoming reminders
        const now = new Date();
        const in7Days = new Date();
        in7Days.setDate(now.getDate() + 7);

        const count = dueReminderRes.data.filter((r) => {
          const due = new Date(r.dueDate);
          return due <= in7Days && r.status !== "done";
        }).length;

        setDueCount(count);
      } catch (err) {
        console.error("Dashboard load error", err);
      }
    };

    fetchData();
  }, [walletId, token]);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const chartData = [
    { name: "Total Income", amount: totalIncome },
    { name: "Total Expense", amount: totalExpense },
  ];

  const getBudgetStatus = (spent, limit) => {
  const usage = spent / limit;
  if (usage > 1) return <XCircle className="text-red-500 w-5 h-5" />;
  if (usage > 0.75) return <AlertCircle className="text-yellow-500 w-5 h-5" />;
  return <CheckCircle className="text-green-500 w-5 h-5" />;
};

  const now = new Date();
  const in7Days = new Date();
  in7Days.setDate(now.getDate() + 7);

  const overdueReminders = reminders.filter(
    (r) => new Date(r.dueDate) < now && r.status !== "done"
  );

  const upcomingReminders = reminders.filter((r) => {
    const due = new Date(r.dueDate);
    return due >= now && due <= in7Days && r.status !== "done";
  });

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
        <div className="text-sm text-gray-500">
          {selectedWallet?.name} ({userRole})
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Chart */}
        <div className="bg-white p-4 shadow rounded border col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold mb-3">Income vs Expense</h3>
          <ResponsiveContainer width="100%" height={200}>
  <BarChart data={chartData}>
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Bar dataKey="amount">
      {chartData.map((entry, index) => (
        <Cell
          key={`cell-${index}`}
          fill={entry.name === "Total Income" ? "#16a34a" : "#dc2626"}
        />
      ))}
    </Bar>
  </BarChart>
</ResponsiveContainer>

        </div>

        {/* Budget Overview */}
        <div className="bg-white p-4 shadow rounded border">
          <h3 className="text-lg font-semibold mb-3">Budgets Overview</h3>
          {budgets.length === 0 ? (
            <p className="text-gray-500 text-sm">No budgets set.</p>
          ) : (
            <ul className="space-y-3">
              {budgets.map((b) => {
                const usage = b.spent / b.limit;
const percent = Math.min(usage * 100, 100);
                return (
                  <li key={b._id}>
                    <div className="flex justify-between items-center text-sm font-medium">
                      <span>{b.category}</span>
                      <span>₹{b.spent} / ₹{b.limit}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-full bg-gray-200 rounded h-2">
                        <div
  className={`h-2 rounded ${
    usage > 1
      ? "bg-red-500"
      : usage > 0.75
      ? "bg-yellow-400"
      : "bg-green-500"
  }`}
  style={{ width: `${percent}%` }}
></div>

                      </div>
                      {getBudgetStatus(b.spent, b.limit)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-4 shadow rounded border col-span-1 md:col-span-2">
          <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm">No transactions found.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {transactions.slice(0, 5).map((tx) => (
                <li key={tx._id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-semibold">{tx.category}</div>
                    <div className="text-xs text-gray-500">{tx.type}</div>
                  </div>
                  <div
                    className={`text-sm font-semibold ${
                      tx.type === "income" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {tx.type === "income" ? "+" : "-"}₹{tx.amount}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Reminders */}
        <div className="bg-white p-4 shadow rounded border">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            Reminders
            {dueCount > 0 && (
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {dueCount}
              </span>
            )}
          </h3>

          {overdueReminders.length === 0 && upcomingReminders.length === 0 ? (
            <p className="text-gray-500 text-sm">No reminders scheduled.</p>
          ) : (
            <div className="space-y-3 text-sm">
              {overdueReminders.length > 0 && (
                <div>
                  <h4 className="text-red-600 font-semibold mb-1">🔴 Overdue</h4>
                  <ul className="space-y-2">
                    {overdueReminders.map((r) => (
                      <li key={r._id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="text-red-500 w-4 h-4" />
                          <span>{r.description}</span>
                        </div>
                        <span>{new Date(r.dueDate).toLocaleDateString("en-GB")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {upcomingReminders.length > 0 && (
                <div>
                  <h4 className="text-yellow-600 font-semibold mb-1">🟡 Upcoming (Next 7 Days)</h4>
                  <ul className="space-y-2">
                    {upcomingReminders.map((r) => (
                      <li key={r._id} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Clock className="text-yellow-500 w-4 h-4" />
                          <span>{r.description}</span>
                        </div>
                        <span>{new Date(r.dueDate).toLocaleDateString("en-GB")}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
