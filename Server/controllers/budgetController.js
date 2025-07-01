
const Budget = require('../models/Budget');
const Wallet = require('../models/Wallet');

const isAuthorizedForWallet = (wallet, userId) => {
  const userIdStr = userId.toString();

  if (wallet.createdBy?.toString() === userIdStr) return true;

  return Array.isArray(wallet.members) &&
    wallet.members.some(
      (m) => m?.userId?.toString?.() === userIdStr
    );
};


exports.createBudget = async (req, res) => {
  console.log("🧩 [createBudget] Hit API");
  try {
    const { walletId, category, limit } = req.body;
    console.log("➡️ Payload:", { walletId, category, limit });
    const userId = req.user.userId || req.user.id;

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (!isAuthorizedForWallet(wallet, userId)) {
      return res.status(403).json({ message: 'Unauthorized to create budget for this wallet' });
    }

    const budget = await Budget.create({
      userId,         // ✅ include this
      walletId,
      category,
      limit,
      spent: 0,
    });

    res.status(201).json(budget);
  } catch (err) {
    console.error("💥 Error creating budget:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getBudgets = async (req, res) => {
  try {
    console.log("📥 [getBudgets] Incoming request");
    const { walletId } = req.params;
    const userId = req.user.userId;

    if (!walletId) {
      return res.status(400).json({ message: "walletId is required" });
    }

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    const isAuthorized = isAuthorizedForWallet(wallet, userId);
    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized to access this wallet's budgets" });
    }

    const budgets = await Budget.find({ walletId });
    res.status(200).json(budgets);
  } catch (err) {
    console.error("💥 Error in getBudgets:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, limit, spent } = req.body;
    const userId = req.user.userId || req.user.id;

    const budget = await Budget.findById(id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const wallet = await Wallet.findById(budget.walletId);
    if (!wallet) {
      return res.status(404).json({ message: 'Associated wallet not found' });
    }

    const authorized = isAuthorizedForWallet(wallet, userId);
    if (!authorized) {
      return res.status(403).json({ message: 'Unauthorized to update this budget' });
    }

    if (category) budget.category = category;
    if (limit) budget.limit = limit;
    if (spent !== undefined) budget.spent = spent;

    await budget.save();
    res.status(200).json(budget);
  } catch (err) {
    console.error("💥 Error updating budget:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId || req.user.id;

    const budget = await Budget.findById(id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const wallet = await Wallet.findById(budget.walletId);
    if (!wallet) {
      return res.status(404).json({ message: 'Associated wallet not found' });
    }

    const authorized = isAuthorizedForWallet(wallet, userId);
    if (!authorized) {
      return res.status(403).json({ message: 'Unauthorized to delete this budget' });
    }

    await Budget.findByIdAndDelete(id);
    res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (err) {
    console.error("💥 Error deleting budget:", err);
    res.status(500).json({ error: err.message });
  }
};
