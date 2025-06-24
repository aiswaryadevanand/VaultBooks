const Budget = require('../models/Budget');

const TEST_USER_ID = '665f8d3a1fcf84c66e65e91a'; // replace with your valid user _id

// @desc Get all budgets
const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: TEST_USER_ID }).sort({ createdAt: -1 });
    res.json(budgets);
  } catch (error) {
    console.error('[GET] Budget error:', error.message);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc Create new budget
const createBudget = async (req, res) => {
  const { category, walletId, amount, period, startDate, endDate } = req.body;
  try {
    const budget = new Budget({
      userId: TEST_USER_ID,
      category,
      walletId,
      amount,
      period,
      startDate,
      endDate
    });

    const saved = await budget.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('[POST] Budget error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

// @desc Update budget
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: TEST_USER_ID },
      req.body,
      { new: true }
    );
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json(budget);
  } catch (error) {
    console.error('[PUT] Budget error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

// @desc Delete budget
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: TEST_USER_ID });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Budget deleted' });
  } catch (error) {
    console.error('[DELETE] Budget error:', error.message);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget
};
