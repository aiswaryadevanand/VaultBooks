import axios from "axios";

const API = axios.create({baseURL: "http://localhost:5000/api"});
API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});
export const createBudget = (data) => API.post("/budgets", data);
export const getBudgets = (walletId) => API.get(`/budgets/${walletId}`);
export const updateBudget = (id, data) => API.put(`/budgets/${id}`, data);
export const deleteBudget = (id, { walletId }) =>
  API.delete(`/budgets/${id}`, {
    data: { walletId }, // 🟢 Axios DELETE supports body via `data` key
  });