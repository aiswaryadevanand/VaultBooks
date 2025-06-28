const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['personal', 'business'],
        required: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    members: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: {
        type: String,
        enum: ['accountant', 'viewer'],
        default: 'viewer',
            },
    },],
}, {
    timestamps: true,
});
module.exports = mongoose.model('Wallet', walletSchema);