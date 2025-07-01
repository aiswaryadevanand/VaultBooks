const express = require('express');
const cors = require('cors');
require('dotenv').config();


const connectDB = require('./config/db');
require('./utils/recurringSchedular');


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

const reportRoutes = require('./routes/reportRoutes');
app.use('/api/reports', reportRoutes); // ✅ This is essential

app.get('/', (req, res) => {
    res.send('VaultBooks Backend is running');
});

const PORT = process.env.PORT || 5000;
 
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
  cron.schedule('0 9 * * *', async () => {
    console.log('Running daily reminder check at 9 AM');

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0); // Set to start of the day

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999); //

    console.log(`Checking reminders due between ${startOfToday} and ${endOfToday}`);
    try{

        // const today = new Date();
        // today.setHours(0, 0, 0, 0); // Set to start of the day

        const dueReminders = await Reminder.find({
            status: {$ne: 'done'},
            dueDate: {
                $gte: startOfToday,
                $lte: endOfToday
            }
        })
        if (dueReminders.length > 0) {
            console.log(` ${dueReminders.length} reminder(s) due today or earlier`);
            // Here you can implement your notification logic
            // For example, send emails or push notifications
            dueReminders.forEach(reminder => {
                console.log(` Reminder: "${reminder.description}" is due on ${reminder.dueDate.toDateString()}`);
                // Implement your notification logic here
            });
        } else {
            console.log('No reminders due today');
        }
    }catch (error) {
        console.error('Error checking reminders:', error.message);
    }
});
});



