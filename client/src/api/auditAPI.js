// import axios from 'axios';

// export const fetchAuditLogs = async (filters = {}) => {
//   const token = localStorage.getItem('token');
//   const res = await axios.get('/api/audit-logs', {
//     headers: { Authorization: `Bearer ${token}` },
//     params: filters
//   });
//   return res.data;
// };
// src/api/auditAPI.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // 🔁 Make sure this points to your backend
});

// Include token in requests
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fetch audit logs with filters
export const fetchAuditLogs = async (filters = {}) => {
  try {
    const res = await API.get('/audit-logs', { params: filters });
    return res.data;
  } catch (err) {
    console.error('❌ Error fetching audit logs:', err);
    throw err;
  }
};
