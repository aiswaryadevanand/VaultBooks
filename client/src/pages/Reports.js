

import React, { useEffect, useState, useRef } from 'react';
import { useSelector } from 'react-redux';
import { fetchIncomeVsExpense } from '../api/reportApi';
import IncomeExpenseLineChart from '../components/charts/IncomeExpenseLineChart';
import ExportButtons from '../components/reports/ExportButtons';

const Reports = () => {
  const selectedWallet = useSelector((state) => state.wallets.selectedWallet);
  const walletId = selectedWallet?._id;

  const [view, setView] = useState('monthly');
  const [chartData, setChartData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chartRef = useRef();

  useEffect(() => {
    if (!walletId) return;

    setLoading(true);
    fetchIncomeVsExpense(walletId, view)
      .then((res) => {
        const { labels, incomeData, expenseData, summary } = res.data;
        setChartData({ labels, incomeData, expenseData });
        setSummary(summary);
        setError('');
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load report');
      })
      .finally(() => setLoading(false));
  }, [walletId, view]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Income vs Expense Trends</h2>

        {/* 🧾 Export buttons on the right */}
        {chartData && chartData.labels.length > 0 && (
          <ExportButtons
            chartRef={chartRef}
            labels={chartData.labels}
            incomeData={chartData.incomeData}
            expenseData={chartData.expenseData}
          />
        )}
      </div>

      <div className="flex items-center gap-4 mb-6">
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

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {summary && (
        <div className="mb-6 bg-gray-100 p-4 rounded-md shadow-sm w-fit">
          <p className="text-green-600 font-semibold">Total Income: ₹{summary.totalIncome}</p>
          <p className="text-red-500 font-semibold">Total Expense: ₹{summary.totalExpense}</p>
        </div>
      )}

      {chartData && chartData.labels.length > 0 ? (
        <div ref={chartRef}>
          <IncomeExpenseLineChart
            labels={chartData.labels}
            incomeData={chartData.incomeData}
            expenseData={chartData.expenseData}
          />
        </div>
      ) : (
        !loading && <p>No data available</p>
      )}
    </div>
  );
};

export default Reports;
