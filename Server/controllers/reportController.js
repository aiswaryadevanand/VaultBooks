
const Transaction = require('../models/Transaction');
const Wallet = require('../models/Wallet');
const logAudit = require('../utils/logAudit');

// ✅ Utility: Get start and end dates of a week
const getWeekRange = (date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 (Sun) - 6 (Sat)
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(d.setDate(diffToMonday));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const format = (d) =>
    `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`;

  return `${format(monday)}–${format(sunday)}`;
};

const isAuthorizedForWallet = (wallet, userId) => {
  if (!wallet || !userId) return false;

  const userIdStr = userId.toString();
  return (
    wallet.createdBy?.toString?.() === userIdStr ||
    wallet.members?.some((m) => m?.userId?.toString?.() === userIdStr)
  );
};

exports.getIncomeVsExpense = async (req, res) => {
  const { walletId, view = 'monthly' } = req.query;
  const userId = req.user?.userId || req.user?._id;

  try {
    if (!walletId) {
      return res.status(400).json({ message: 'walletId is required' });
    }

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (!isAuthorizedForWallet(wallet, userId)) {
      return res.status(403).json({ message: 'Unauthorized access to this wallet' });
    }

    const transactions = await Transaction.find({
      walletId,
      userId,
      type: { $in: ['income', 'expense'] },
    });

    const grouped = {};
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((txn) => {
      const date = new Date(txn.date);
      let key, label;

      if (view === 'weekly') {
        const weekStart = new Date(date);
        const day = weekStart.getDay();
        const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
        weekStart.setDate(diff);
        const keyDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        key = keyDate.toISOString().split('T')[0];
        label = getWeekRange(date);
      } else {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        key = `${date.getFullYear()}-${month}`;
        label = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      }

      if (!grouped[key]) {
        grouped[key] = { label, income: 0, expense: 0 };
      }

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

    // ✅ Log audit
    await logAudit({
      userId,
      walletId,
      action: 'view-report',
      details: {
        viewType: view,
        totalIncome,
        totalExpense,
        timeSpan: view === 'weekly' ? 'Weekly Overview' : 'Monthly Overview'
      }
    });

    res.json({
      labels,
      incomeData,
      expenseData,
      summary: { totalIncome, totalExpense }
    });
  } catch (err) {
    console.error("💥 Income vs Expense Error:", err);
    res.status(500).json({ error: 'Server error', message: err.message });
  }
};
