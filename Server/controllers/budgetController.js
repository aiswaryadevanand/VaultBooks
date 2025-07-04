
const Budget = require('../models/Budget');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const logAudit = require('../utils/logAudit');

const isAuthorizedForWallet = (wallet, userId) => {
  const userIdStr = userId.toString();
  if (wallet.createdBy?.toString() === userIdStr) return true;
  return Array.isArray(wallet.members) && wallet.members.some(
    (m) => m?.userId?.toString?.() === userIdStr
  );
};

exports.createBudget = async (req, res) => {
  console.log(" [createBudget] Hit API");
  try {
    const { walletId, category, limit } = req.body;
    const userId = req.user.userId || req.user.id;
    const normalizedCategory = category.trim().toLowerCase();

    const wallet = await Wallet.findById(walletId);
    if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
    if (!isAuthorizedForWallet(wallet, userId)) return res.status(403).json({ message: 'Unauthorized' });

    const expenseTransactions = await Transaction.find({
      walletId,
      userId,
      type: 'expense',
      category: { $regex: new RegExp(`^${normalizedCategory}$`, 'i') },
    });

    const spent = expenseTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);

    const budget = await Budget.create({
      userId,
      walletId,
      category: normalizedCategory,
      limit: Number(limit),
      spent,
    });

    await logAudit({
      userId,
      walletId,
      action: 'create-budget',
      details: { category: normalizedCategory, limit, spent }
    });

    res.status(201).json(budget);
  } catch (err) {
    console.error(" Error creating budget:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getBudgets = async (req, res) => {
  try {
    const { walletId } = req.params;
    const userId = req.user.userId;
    if (!walletId) return res.status(400).json({ message: "walletId is required" });

    const wallet = await Wallet.findById(walletId);
    if (!wallet) return res.status(404).json({ message: "Wallet not found" });
    if (!isAuthorizedForWallet(wallet, userId)) return res.status(403).json({ message: "Unauthorized" });

    const budgets = await Budget.find({ walletId });
    res.status(200).json(budgets);
  } catch (err) {
    console.error(" Error in getBudgets:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, limit, spent } = req.body;
    const userId = req.user.userId || req.user.id;

    const budget = await Budget.findById(id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    const wallet = await Wallet.findById(budget.walletId);
    if (!wallet) return res.status(404).json({ message: 'Associated wallet not found' });
    if (!isAuthorizedForWallet(wallet, userId)) return res.status(403).json({ message: 'Unauthorized' });

    // Track changes for audit logging
    const changes = {};

    if (category && category.trim().toLowerCase() !== budget.category) {
      changes.category = { from: budget.category, to: category.trim().toLowerCase() };
      budget.category = category.trim().toLowerCase();
    }

    if (limit !== undefined && Number(limit) !== budget.limit) {
      changes.limit = { from: budget.limit, to: Number(limit) };
      budget.limit = Number(limit);
    }

    if (spent !== undefined && Number(spent) !== budget.spent) {
      changes.spent = { from: budget.spent, to: Number(spent) };
      budget.spent = Number(spent);
    }

    await budget.save();

    // Only log if something changed
    if (Object.keys(changes).length > 0) {
      await logAudit({
        userId,
        walletId: wallet._id,
        action: 'update-budget',
        details: changes
      });
    }

    res.status(200).json(budget);
  } catch (err) {
    console.error(" Error updating budget:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const budget = await Budget.findById(id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    const wallet = await Wallet.findById(budget.walletId);
    if (!wallet) return res.status(404).json({ message: 'Associated wallet not found' });
    if (!isAuthorizedForWallet(wallet, userId)) return res.status(403).json({ message: 'Unauthorized' });

    await Budget.findByIdAndDelete(id);

    await logAudit({
      userId,
      walletId: wallet._id,
      action: 'delete-budget',
      details: { budgetId: id, category: budget.category, limit: budget.limit }
    });

    res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (err) {
    console.error(" Error deleting budget:", err);
    res.status(500).json({ error: err.message });
  }
};
