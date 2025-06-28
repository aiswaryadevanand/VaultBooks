const Budget = require('../models/Budget');
const Wallet = require('../models/Wallet');

const isAuthorizedForWallet = (wallet, userId) => {
const userIdStr = userId.toString();
return (
wallet.createdBy.toString() === userIdStr ||
wallet.members.some((m) => m.userId.toString() === userIdStr)
);
};

exports.createBudget = async (req, res) => {
  console.log("🧩 [createBudget] Hit API");
try {
const { walletId, category, limit } = req.body;
console.log("➡️ Payload:", { walletId, category, limit });
const userId = req.user.userId || req.user.id; // Assuming user ID is stored in req.user


const wallet = await Wallet.findById(walletId);
console.log("📄 Wallet Found?", wallet);
if (!wallet) {
  return res.status(404).json({ message: 'Wallet not found' });
}

if (!isAuthorizedForWallet(wallet, userId)) {
  return res.status(403).json({ message: 'Unauthorized to create budget for this wallet' });
}

const budget = await Budget.create({
  walletId,
  category,
  limit,
  spent: 0,
});

res.status(201).json(budget);
} catch (err) {
res.status(500).json({ error: err.message });
}
};

exports.getBudgets = async (req, res) => {
  try {
    console.log("📥 [getBudgets] Incoming request");
    console.log("🧾 req.params:", req.params);
    console.log("🧾 req.user:", req.user);

    const { walletId } = req.params;
    const userId = req.user.userId;

    if (!walletId) {
      console.error("❌ walletId is undefined");
      return res.status(400).json({ message: "walletId is required" });
    }

    const wallet = await Wallet.findById(walletId);
    if (!wallet) {
      console.error("❌ Wallet not found");
      return res.status(404).json({ message: "Wallet not found" });
    }

    const isAuthorized = wallet.createdBy.toString() === userId.toString() ||
      wallet.members.some((m) => m.userId.toString() === userId.toString());

    if (!isAuthorized) {
      console.error("⛔ Unauthorized access");
      return res.status(403).json({ message: "Not authorized to access this wallet's budgets" });
    }

    const budgets = await Budget.find({ walletId });
    console.log("✅ Budgets fetched:", budgets.length);
    res.status(200).json(budgets);
  } catch (err) {
    console.error("💥 Error in getBudgets:", err.message);
    res.status(500).json({ error: err.message });
  }
};
exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, limit, spent } = req.body;
    const userId = req.user.userId || req.user.id;

    console.log("📝 Update Budget ID:", id);
    console.log("👤 User ID:", userId);
    console.log("✏️ Update Fields:", { category, limit, spent });

    const budget = await Budget.findById(id);
    if (!budget) {
      console.error("❌ Budget not found");
      return res.status(404).json({ message: 'Budget not found' });
    }

    const wallet = await Wallet.findById(budget.walletId);
    if (!wallet) {
      console.error("❌ Wallet not found for budget");
      return res.status(404).json({ message: 'Associated wallet not found' });
    }

    const authorized = wallet.createdBy.toString() === userId.toString() ||
      wallet.members.some(m => m.userId.toString() === userId.toString());

    if (!authorized) {
      console.error("⛔ Unauthorized to update");
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

    console.log("🗑️ Delete Budget ID:", id);
    console.log("👤 User ID:", userId);

    const budget = await Budget.findById(id);
    if (!budget) {
      console.error("❌ Budget not found");
      return res.status(404).json({ message: 'Budget not found' });
    }

    const wallet = await Wallet.findById(budget.walletId);
    if (!wallet) {
      console.error("❌ Wallet not found for budget");
      return res.status(404).json({ message: 'Associated wallet not found' });
    }

    const authorized = wallet.createdBy.toString() === userId.toString() ||
      wallet.members.some(m => m.userId.toString() === userId.toString());

    if (!authorized) {
      console.error("⛔ Unauthorized to delete");
      return res.status(403).json({ message: 'Unauthorized to delete this budget' });
    }

    await Budget.findByIdAndDelete(id);
    res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (err) {
    console.error("💥 Error deleting budget:", err);
    res.status(500).json({ error: err.message });
  }
};
