import axios from "axios";

const API = axios.create({baseURL: "http://localhost:5000/api"});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem("token");
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const createReminder = (data) => API.post("/reminders", data);
export const getReminders = (walletId) => API.get(`/reminders/${walletId}`);
export const updateReminder = (id, data) =>
  API.put(`/reminders/${id}`, data);
export const deleteReminder = (id, walletId) =>
  API.delete(`/reminders/${id}`, { data: { walletId } });