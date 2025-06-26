const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    walletId: {
        type: mongoose.Schema.Types.ObjectId,   
        ref: 'Wallet',
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    frequency: {
        type: String,
        enum: ['weekly', 'monthly'],
        default: 'monthly',
    },
    status: {
        type: String,
        enum: ['pending', 'done'],
        default: 'pending',
    },
},{timestamps: true});

module.exports = mongoose.model('Reminder', reminderSchema);
