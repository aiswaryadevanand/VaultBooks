
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

  const [view, setView] = useState('monthly');
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
      fetchIncomeVsExpense(walletId, view),
      fetchExpenseByCategory(walletId),
      fetchWalletPerformance(),
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
  }, [walletId, view]);

  return (
    <div className="p-6 space-y-6">
      {/* 🔧 Filters */}
      <div className="flex items-center gap-4">
        <label className="font-semibold">View:</label>
        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {/* 📈 Income vs Expense */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Income vs Expense Trends</h2>

        {summary && (
          <div className="bg-gray-100 p-4 rounded-md shadow-sm w-fit mb-4">
            <p className="text-green-600 font-semibold">Total Income: ₹{summary.totalIncome}</p>
            <p className="text-red-500 font-semibold">Total Expense: ₹{summary.totalExpense}</p>
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
      {pieData.labels.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mt-6 mb-2">Expense Breakdown by Category</h3>
          <CategoryExpensePieChart labels={pieData.labels} data={pieData.data} />
        </div>
      )}

      {/* 📊 Wallet Performance */}
      {walletData.labels.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mt-6 mb-2">Wallet Performance</h3>
          <WalletPerformanceChart
            labels={walletData.labels}
            incomeData={walletData.income}
            expenseData={walletData.expense}
          />
        </div>
      )}

      {/* 📤 Export Buttons at Bottom */}
      {(chartData || pieData.labels.length > 0 || walletData.labels.length > 0) && (
        <div className="mt-8">
          <ExportButtons
            lineChart={chartData}
            pieChart={pieData}
            walletChart={walletData}
            summary={summary}
          />
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default Reports;
