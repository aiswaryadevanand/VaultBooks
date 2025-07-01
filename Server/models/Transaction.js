

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true
  },
  toWalletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    default: null
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'transfer'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  note: {
    type: String
  },
  tags: {
    type: [String],
    default: []
  },
  fileUrl: {
    type: String
  },
  date: {
    type: Date,
    required: true
  },
  isMirror: {
  type: Boolean,
  default: false
},

  // ✅ Recurring transaction fields
  recurring: {
    type: Boolean,
    default: false
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  nextDate: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
