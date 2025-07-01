
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const logAudit = require('../utils/logAudit');

const calculateNextDate = (date, frequency) => {
  const next = new Date(date);
  switch (frequency) {
    case 'daily': next.setDate(next.getDate() + 1); break;
    case 'weekly': next.setDate(next.getDate() + 7); break;
    case 'monthly': next.setMonth(next.getMonth() + 1); break;
    case 'yearly': next.setFullYear(next.getFullYear() + 1); break;
  }
  return next;
};

// @desc Get all transactions for logged-in user, optionally filtered by wallet
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { walletId } = req.query;
    const filter = { userId };
    if (walletId) filter.walletId = walletId;

    const transactions = await Transaction.find(filter)
      .populate({ path: 'walletId', select: 'name type' })
      .populate({ path: 'toWalletId', select: 'name type' })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server Error' });
  }
};

// @desc Create new transaction
const createTransaction = async (req, res) => {
  const userId = req.user.userId;
  const {
    category, amount, type, note, date, tags,
    walletId, toWalletId, recurring, frequency
  } = req.body;

  const fileUrl = req.file ? `uploads/${req.file.filename}` : null;
  const nextDate = recurring && frequency ? calculateNextDate(date, frequency) : null;

  try {
    if (type === 'transfer') {
      if (!walletId || !toWalletId || walletId === toWalletId) {
        return res.status(400).json({ error: 'Invalid transfer wallets' });
      }

      const fromTx = new Transaction({
        userId, type, category, amount, note, date, tags,
        walletId, toWalletId, fileUrl, recurring, frequency,
        nextDate, isMirror: false,
      });

      const toTx = new Transaction({
        userId, type, category, amount, note, date, tags,
        walletId: toWalletId, toWalletId: walletId, fileUrl,
        recurring, frequency, nextDate, isMirror: true,
      });

      await fromTx.save();
      await toTx.save();

      return res.status(201).json({ from: fromTx, to: toTx });
    }

    const transaction = new Transaction({
      userId, type, category, amount, note, date, tags,
      walletId, fileUrl, recurring, frequency, nextDate, isMirror: false,
    });

    const saved = await transaction.save();

    if (type === 'expense') {
      const budget = await Budget.findOne({ walletId, category, userId });
      if (budget) {
        budget.spent += amount;
        await budget.save();
      }
    }

    await logAudit({
      userId,
      walletId,
      action: 'create-transaction',
      details: { category, amount, type, note, date, tags }
    });

    res.status(201).json(saved);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(400).json({ error: error.message });
  }
};

const updateTransaction = async (req, res) => {
  const userId = req.user.userId;
  const transactionId = req.params.id;
  const {
    category, amount, type, note, date, tags,
    walletId, toWalletId, recurring, frequency
  } = req.body;

  const fileUrl = req.file ? `uploads/${req.file.filename}` : null;
  const nextDate = recurring && frequency ? calculateNextDate(date, frequency) : null;

  try {
    const existing = await Transaction.findOne({ _id: transactionId, userId });
    if (!existing) return res.status(404).json({ message: 'Transaction not found' });
    if (existing.isMirror) {
      return res.status(400).json({ message: 'Cannot edit mirrored transaction directly' });
    }

    if (existing.type === 'expense') {
      const oldBudget = await Budget.findOne({ walletId: existing.walletId, category: existing.category, userId });
      if (oldBudget) {
        oldBudget.spent = Math.max(0, oldBudget.spent - existing.amount);
        await oldBudget.save();
      }
    }

    const nextDate = recurring && frequency ? calculateNextDate(date, frequency) : null;

    const updatedFields = {
      category,
      amount,
      type,
      note,
      date,
      tags,
      walletId,
      recurring,
      frequency,
      nextDate
    };
    if (fileUrl) updatedFields.fileUrl = fileUrl;

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId },
      updatedFields,
      { new: true }
    );

    // Update budget
    if (updatedTransaction.type === 'expense') {
      const newBudget = await Budget.findOne({ walletId: updatedTransaction.walletId, category: updatedTransaction.category, userId });
      if (newBudget) {
        newBudget.spent += updatedTransaction.amount;
        await newBudget.save();
      }
    }

    await logAudit({
      userId,
      walletId,
      action: 'update-transaction',
      details: { transactionId, updatedFields }
    });

    res.json(updatedTransaction);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// @desc Delete transaction
const deleteTransaction = async (req, res) => {
  const userId = req.user.userId;
  try {
    const deleted = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Rollback budget
    if (deleted.type === 'expense') {
      const budget = await Budget.findOne({ walletId: deleted.walletId, category: deleted.category, userId });
      const budget = await Budget.findOne({ walletId: existing.walletId, category: existing.category, userId });
      if (budget) {
        budget.spent = Math.max(0, budget.spent - existing.amount);
        await budget.save();
      }
    }

    await logAudit({
      userId,
      walletId: deleted.walletId,
      action: 'delete-transaction',
      details: {
        transactionId: deleted._id,
        amount: deleted.amount,
        category: deleted.category
      }
    });

    res.json({ message: 'Transaction deleted' });
    const updatedFields = {
      category, amount, type, note, date, tags,
      walletId, recurring, frequency, nextDate
    };
    if (fileUrl) updatedFields.fileUrl = fileUrl;

    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: transactionId, userId }, updatedFields, { new: true }
    );

    if (updatedTransaction.type === 'expense') {
      const budget = await Budget.findOne({ walletId, category, userId });
      if (budget) {
        budget.spent += updatedTransaction.amount;
        await budget.save();
      }
    }

    if (updatedTransaction.type === 'transfer') {
      await Transaction.findOneAndUpdate({
        userId, type: 'transfer', isMirror: true,
        amount: existing.amount, date: existing.date, category: existing.category,
        walletId: existing.toWalletId, toWalletId: existing.walletId,
      }, {
        category, amount, note, date, tags,
        walletId: toWalletId, toWalletId: walletId,
        recurring, frequency, nextDate,
        ...(fileUrl && { fileUrl }),
      });
    }

    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(400).json({ error: error.message });
  }
};

const deleteTransaction = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  console.log('👉 DELETE called with ID:', req.params.id);
console.log('👉 Authenticated user:', req.user);

  try {
    const transaction = await Transaction.findById(id);

    if (transaction.type === 'transfer') {
      const mirrorTx = await Transaction.findOne({
        userId, type: 'transfer', isMirror: !transaction.isMirror,
        amount: transaction.amount, date: transaction.date, category: transaction.category,
        walletId: transaction.toWalletId, toWalletId: transaction.walletId,
      });
      if (mirrorTx) await mirrorTx.deleteOne();
    }

    if (transaction.type === 'expense') {
      const budget = await Budget.findOne({ walletId: transaction.walletId, category: transaction.category, userId });
      if (budget) {
        budget.spent = Math.max(0, budget.spent - transaction.amount);
        await budget.save();
      }
    }

    await transaction.deleteOne();
    

    res.json({ message: 'Transaction deleted' });
    
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction
};
