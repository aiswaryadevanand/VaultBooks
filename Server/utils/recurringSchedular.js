

const cron = require('node-cron');
const Transaction = require('../models/Transaction');

 
const calculateNextDate = (date, frequency) => {
  const d = new Date(date);
  switch (frequency) {
    case 'daily':
      d.setDate(d.getDate() + 1);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7);
      break;
    case 'monthly':
      const day = d.getDate();
      d.setMonth(d.getMonth() + 1);
      
      if (d.getDate() < day) {
        d.setDate(0); 
      }
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      break;
  }
  return d;
};

/**
 * Generate recurring transactions up to today
 */
const generateRecurringTransactions = async () => {
  try {
    console.log(' Running recurring transaction job...');
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    const transactions = await Transaction.find({
      recurring: true,
      nextDate: { $lte: today },
    });

    for (const tx of transactions) {
      let nextDate = new Date(tx.nextDate);

      while (nextDate <= today) {
        // Clone original transaction
        const txObj = tx.toObject();
        delete txObj._id;

        const newTx = new Transaction({
          ...txObj,
          date: new Date(nextDate),
          nextDate: null, // This will be handled after loop
        });

        await newTx.save();
        console.log(` Created recurring tx on ${newTx.date.toDateString()}`);

        // Calculate next cycle
        nextDate = calculateNextDate(nextDate, tx.frequency);
      }

      // Update the original transaction's nextDate
      tx.nextDate = nextDate;
      await tx.save();
    }
  } catch (error) {
    console.error(' Error generating recurring transactions:', error);
  }
};

//  Cron job: run daily at midnight (production use)
 cron.schedule('0 0 * * *', generateRecurringTransactions);



module.exports = generateRecurringTransactions;
