# 💼 VaultBooks

**VaultBooks** is a full-stack financial management app that allows individuals and teams to track income, expenses, budgets, and reminders across multiple wallets. Built using the **MERN stack** (MongoDB, Express, React, Node.js), it supports user roles, collaborative wallets, and visual dashboards.

---

## 🚀 Features

### ✅ Authentication
- User registration, login, logout
- Forgot/Reset password via email
- JWT-based secure sessions

### 🧑‍🤝‍🧑 Wallets with Roles
- Create personal or business wallets
- Invite team members with roles:
  - **Owner**: Full access
  - **Editor**: Can manage transactions/budgets
  - **Viewer**: Read-only

### 💳 Transactions
- Add, view, edit, and delete transactions
- Types: Income, Expense, Transfer
- Include tags, notes, attachments

### 📊 Dashboard
- Visual charts: Income vs Expense
- Budget summaries
- Recent transactions
- Reminder overview with badge count

### 🧾 Budgets
- Set category-wise budget limits
- Track spending against limits

### ⏰ Reminders
- Create reminders with due dates and frequency
- Daily backend cron job checks due items
- Badge notifications shown in UI

### 🧠 Audit Logs *(planned)*
- Log important actions (e.g., transaction edits, member changes)

---

## 🛠 Tech Stack

### Frontend:
- React.js (with Router)
- Redux Toolkit (state management)
- Tailwind CSS
- Axios

### Backend:
- Node.js + Express
- MongoDB + Mongoose
- JWT Auth
- Nodemailer (for reset password)
- Node-cron (for scheduled tasks)

---

## 📂 Folder Structure

vaultbooks/
├── client/ # React frontend
│ ├── pages/
│ ├── components/
│ ├── redux/
│ └── assets/
├── server/ # Express backend
│ ├── models/
│ ├── routes/
│ ├── controllers/
│ ├── middleware/
│ └── utils/

