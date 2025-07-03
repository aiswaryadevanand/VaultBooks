
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const logAudit = require('../utils/logAudit');

// ✅ Utility: Get week range as label
const getWeekRange = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const format = (d) =>
    `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;
  return `${format(monday)}–${format(sunday)}`;
};

// ✅ Utility: Get month date range
const getMonthRange = (monthStr) => {
  if (!monthStr) return null;
  const [year, month] = monthStr.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);
  return { startDate, endDate };
};

// ✅ Utility: Check wallet access
const isAuthorizedForWallet = (wallet, userId) => {
  if (!wallet || !userId) return false;
  const userIdStr = userId.toString();
  return (
    wallet.createdBy?.toString?.() === userIdStr ||
    wallet.members?.some((m) => m?.userId?.toString?.() === userIdStr)
  );
};

// 📈 1. Income vs Expense
exports.getIncomeVsExpense = async (req, res) => {
  const { walletId, view = 'monthly', month } = req.query;
  const userId = req.user?.userId || req.user?._id;

  try {
    if (!walletId) return res.status(400).json({ message: 'walletId is required' });

    const wallet = await Wallet.findById(walletId);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    if (!isAuthorizedForWallet(wallet, userId)) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const dateFilter = getMonthRange(month);
    const transactions = await Transaction.find({
      walletId,
      userId,
      type: { $in: ['income', 'expense'] },
      ...(dateFilter && { date: { $gte: dateFilter.startDate, $lte: dateFilter.endDate } }),
    });

    const grouped = {};
    let totalIncome = 0, totalExpense = 0;

    transactions.forEach((txn) => {
      const date = new Date(txn.date);
      let key, label;

      if (view === 'weekly') {
        const weekStart = new Date(date);
        const diff = weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1);
        weekStart.setDate(diff);
        const keyDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        key = keyDate.toISOString().split('T')[0];
        label = getWeekRange(date);
      } else {
        const monthStr = String(date.getMonth() + 1).padStart(2, '0');
        key = `${date.getFullYear()}-${monthStr}`;
        label = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      }

      if (!grouped[key]) grouped[key] = { label, income: 0, expense: 0 };
      if (txn.type === 'income') {
        grouped[key].income += txn.amount;
        totalIncome += txn.amount;
      } else if (txn.type === 'expense') {
        grouped[key].expense += txn.amount;
        totalExpense += txn.amount;
      }
    });

    const sortedKeys = Object.keys(grouped).sort();
    const labels = sortedKeys.map(k => grouped[k].label);
    const incomeData = sortedKeys.map(k => grouped[k].income);
    const expenseData = sortedKeys.map(k => grouped[k].expense);

    res.json({ labels, incomeData, expenseData, summary: { totalIncome, totalExpense } });
  } catch (err) {
    console.error("💥 Income vs Expense Error:", err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};

// 🥧 2. Expense by Category
exports.getExpenseByCategory = async (req, res) => {
  const { walletId, month } = req.query;
  const userId = req.user?._id || req.user?.userId;

  try {
    if (!walletId) return res.status(400).json({ message: 'walletId is required' });

    const wallet = await Wallet.findById(walletId);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    if (!isAuthorizedForWallet(wallet, userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const dateFilter = getMonthRange(month);

    const matchStage = {
      walletId: new mongoose.Types.ObjectId(walletId),
      type: 'expense',
      userId: new mongoose.Types.ObjectId(userId),
      ...(dateFilter && { date: { $gte: dateFilter.startDate, $lte: dateFilter.endDate } }),
    };

    const categorySummary = await Transaction.aggregate([
      { $match: matchStage },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);

    const labels = categorySummary.map(c => c._id || 'Uncategorized');
    const data = categorySummary.map(c => c.total);

    res.json({ labels, data });
  } catch (err) {
    console.error('💥 Expense by Category Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// 📊 3. Wallet Performance
exports.getWalletPerformance = async (req, res) => {
  const { month } = req.query;
  const userId = req.user?._id || req.user?.userId;

  try {
    const wallets = await Wallet.find({
      $or: [
        { createdBy: userId },
        { members: { $elemMatch: { userId } } },
      ],
    });

    const walletIds = wallets.map((w) => w._id);
    const dateFilter = getMonthRange(month);

    const matchStage = {
      walletId: { $in: walletIds },
      type: { $in: ['income', 'expense'] },
      userId: new mongoose.Types.ObjectId(userId),
      ...(dateFilter && { date: { $gte: dateFilter.startDate, $lte: dateFilter.endDate } }),
    };

    const transactions = await Transaction.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { walletId: '$walletId', type: '$type' },
          total: { $sum: '$amount' },
        },
      },
    ]);

    const resultMap = {};
    for (const txn of transactions) {
      const walletId = txn._id.walletId.toString();
      const type = txn._id.type;
      if (!resultMap[walletId]) resultMap[walletId] = { income: 0, expense: 0 };
      resultMap[walletId][type] = txn.total;
    }

    const labels = [];
    const income = [];
    const expense = [];

    wallets.forEach((wallet) => {
      const id = wallet._id.toString();
      const data = resultMap[id] || { income: 0, expense: 0 };
      labels.push(wallet.name);
      income.push(data.income);
      expense.push(data.expense);
    });

    res.json({ labels, income, expense });
  } catch (err) {
    console.error('💥 Wallet Performance Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 🗂 4. Get Distinct Categories
exports.getDistinctCategories = async (req, res) => {
  try {
    const userId = req.user._id;
    const categories = await Transaction.distinct('category', { userId });
    res.json({ categories });
  } catch (error) {
    console.error('💥 Get Distinct Categories Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📝 5. Log Export Action
exports.logExportAction = async (req, res) => {
  const { action, walletId, details } = req.body;
  const userId = req.user?._id || req.user?.userId;

  const validActions = ['export-pdf', 'export-excel'];
  if (!validActions.includes(action)) {
    return res.status(400).json({ message: 'Invalid export action' });
  }

  try {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

    const isMember = isAuthorizedForWallet(wallet, userId);
    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to export this wallet\'s reports' });
    }

    await logAudit({
      userId,
      walletId,
      action,
      details: {
        ...details,
        exportedAt: new Date(),
      },
    });

    res.status(200).json({ message: 'Export action logged successfully' });
  } catch (error) {
    console.error('💥 Export Action Logging Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
