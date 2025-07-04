
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // ✅ Update this if deploying
});

// 🔐 Attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


export const fetchAuditLogs = async (filters = {}, page = 1, limit = 10) => {
  try {
    const { walletId, action, date } = filters;
    const params = { page, limit };
    if (walletId) params.walletId = walletId;
    if (action) params.action = action;
    if (date) params.date = date;

    const res = await API.get('/audit-logs', { params });
    return res.data; // Expected to return { logs, totalPages, currentPage }
  } catch (err) {
    console.error('❌ Error fetching audit logs:', err.response?.data || err.message);
    throw err;
  }
};
