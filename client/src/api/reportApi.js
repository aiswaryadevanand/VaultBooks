

// src/api/reportApi.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// ✅ Line Chart
export const fetchIncomeVsExpense = (walletId, view = 'monthly', month) =>
  API.get('/reports/income-vs-expense', {
    params: { walletId, view, month },
  });

// ✅ Pie Chart (removed category param)
export const fetchExpenseByCategory = (walletId, month) =>
  API.get('/reports/expense-by-category', {
    params: { walletId, month },
  });

// ✅ Bar Chart - Wallet Performance
export const fetchWalletPerformance = (month) =>
  API.get('/reports/wallet-performance', {
    params: { month },
  });
