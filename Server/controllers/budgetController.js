const Budget= require('../models/Budget');
const Wallet = require('../models/Wallet');

const isAuthorizedForWallet = (wallet, userId) => {
  return wallet.createdBy.equals(userId) || wallet.members.some(m => m.user.equals(userId));
}

exports.createBudget = async (req, res) => {
  try {
    const { walletId, category, limit } = req.body;
    const userId=req.user.userId

    const wallet = await Wallet.findById(walletId);
    if (!wallet){
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (!isAuthorizedForWallet(wallet, userId)) {
      return res.status(403).json({ message: 'Unauthorized to create budget for this wallet' });
    }

    const budget = await Budget.create({
      walletId,
      category,
      limit
    });
    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBudgets = async (req, res) => {
  try {
    const { walletId } = req.params;
    const userId = req.user.userId;

    const wallet= await Wallet.findById(walletId);
    if (!wallet) {
      return res.status(404).json({ message: 'Wallet not found' });
    }

    if (!isAuthorizedForWallet(wallet, userId)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const budgets = await Budget.find({ walletId });
    res.status(200).json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
exports.updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, limit,spent } = req.body;
    const userId = req.user.userId;

    const budget = await Budget.findById(id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const wallet = await Wallet.findById(budget.walletId);
    if (!wallet || !isAuthorizedForWallet(wallet, userId)) {
      return res.status(403).json({ message: 'Unauthorized to update this budget' });
    }

    if (category) budget.category = category;
    if (limit) budget.limit = limit;
    if (spent!==undefined) budget.spent = spent;
    
    await budget.save();
    res.status(200).json(budget);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const budget = await Budget.findById(id);
    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const wallet = await Wallet.findById(budget.walletId);
    if (!wallet || !isAuthorizedForWallet(wallet, userId)) {
      return res.status(403).json({ message: 'Unauthorized to delete this budget' });
    }

    await Budget.findByIdAndDelete(id);
    res.status(200).json({ message: 'Budget deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};