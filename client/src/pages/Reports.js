
import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  fetchIncomeVsExpense,
  fetchExpenseByCategory,
  fetchWalletPerformance,
} from '../api/reportApi';
import IncomeExpenseLineChart from '../components/charts/IncomeExpenseLineChart';
import CategoryExpensePieChart from '../components/charts/CategoryExpensePieChart';
import WalletPerformanceChart from '../components/charts/WalletPerformanceChart';
import ExportButtons from '../components/reports/ExportButtons';

const Reports = () => {
  const selectedWallet = useSelector((state) => state.wallets.selectedWallet);
  const walletId = selectedWallet?._id;
  const userRole = useSelector((state) => state.wallets.userRole || 'viewer');

  const [view, setView] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [chartData, setChartData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [pieData, setPieData] = useState({ labels: [], data: [] });
  const [walletData, setWalletData] = useState({ labels: [], income: [], expense: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chartRef = useRef();

  useEffect(() => {
    if (!walletId) return;

    setLoading(true);

    Promise.all([
      fetchIncomeVsExpense(walletId, view, selectedMonth),
      fetchExpenseByCategory(walletId, selectedMonth),
      fetchWalletPerformance(selectedMonth),
    ])
      .then(([lineRes, pieRes, walletRes]) => {
        const { labels, incomeData, expenseData, summary } = lineRes.data;
        setChartData({ labels, incomeData, expenseData });
        setSummary(summary);

        const { labels: pieLabels, data: pieAmounts } = pieRes.data;
        setPieData({ labels: pieLabels, data: pieAmounts });

        const { labels: walletLabels, income, expense } = walletRes.data;
        setWalletData({ labels: walletLabels, income, expense });

        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load report data');
      })
      .finally(() => setLoading(false));
  }, [walletId, view, selectedMonth]);

  return (
    <div className="p-6 space-y-6">
      {/* 🔍 Month Filter */}
      <div className="flex justify-start items-center gap-4">
        <label className="font-medium text-sm">Month:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      {/* 📊 Chart Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 📈 Income vs Expense */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Income vs Expense</h2>
            <select
              value={view}
              onChange={(e) => setView(e.target.value)}
              className="border px-2 py-1 rounded text-sm"
            >
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          {summary && (
            <div className="text-sm mb-3">
              <p className="text-green-600">Income: ₹{summary.totalIncome}</p>
              <p className="text-red-500">Expense: ₹{summary.totalExpense}</p>
            </div>
          )}

          {chartData?.labels?.length > 0 && (
            <div ref={chartRef}>
              <IncomeExpenseLineChart
                labels={chartData.labels}
                incomeData={chartData.incomeData}
                expenseData={chartData.expenseData}
              />
            </div>
          )}
        </div>

        {/* 🥧 Expense by Category */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Expense Breakdown by Category</h2>
          {pieData.labels.length > 0 && (
            <CategoryExpensePieChart labels={pieData.labels} data={pieData.data} />
          )}
        </div>
      </div>

      {/* 📊 Wallet Performance (Full width) */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Wallet Performance</h2>
        {walletData.labels.length > 0 && (
          <WalletPerformanceChart
            labels={walletData.labels}
            incomeData={walletData.income}
            expenseData={walletData.expense}
          />
        )}
      </div>

      {/* 📤 Export Buttons — Only for Owners */}
      {userRole === 'owner' &&
        (chartData || pieData.labels.length > 0 || walletData.labels.length > 0) && (
          <div className="flex flex-col items-center mt-6">
            <p className="font-medium mb-2">Export Reports</p>
            <ExportButtons
              lineChart={chartData}
              pieChart={pieData}
              walletChart={walletData}
              summary={summary}
              selectedMonth={selectedMonth}
              view={view}
            />
          </div>
        )}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default Reports;
