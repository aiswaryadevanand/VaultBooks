const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());
const cron=require('node-cron');
const Reminder = require('./models/Reminder');



//✅ Connect your routes here
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
const walletRoutes = require('./routes/walletRoutes');
app.use('/api/wallets', walletRoutes);


const transactionRoutes = require('./routes/transactionRoutes');
app.use('/api/transactions', transactionRoutes);

// 🔥 Serve uploads folder statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const budgetRoutes = require('./routes/budgetRoutes');
app.use('/api/budgets', budgetRoutes);

const reminderRoutes = require('./routes/reminderRoutes');
app.use('/api/reminders', reminderRoutes);


app.get('/', (req, res) => {
    res.send('VaultBooks Backend is running');
});

const PORT = process.env.PORT || 5000;
 
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
  
});



