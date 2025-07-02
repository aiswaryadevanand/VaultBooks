const Reminder = require('../models/Reminder');

exports.createReminder = async (req, res) => {
    try {
        const reminder = await Reminder.create({ ...req.body });
        res.status(201).json(reminder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getReminders = async (req, res) => {
    try {
        const reminders = await Reminder.find({ walletId: req.params.walletId }).sort({ createdAt: -1 });
        res.json(reminders);
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateReminder = async (req, res) => {
    try {
        const reminder = await Reminder.findByIdAndUpdate(req.params.id, req.body, {new: true});
        res.json(reminder);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteReminder = async (req, res) => {
    try {
        await Reminder.findByIdAndDelete(req.params.id);
        res.json({ message: 'Reminder deleted' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getDueReminders = async (req, res) => {
  const { walletId } = req.query;
  const userId = req.user.userId;

  try {
    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);

    const reminders = await Reminder.find({
      walletId,
      dueDate: { $lte: next7Days },
      status: { $ne: 'done' },
    }).sort({ dueDate: 1 });

    res.json(reminders);
  } catch (err) {
    console.error("🚫 getDueReminders error:", err.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to fetch due reminders' });
    }
  }
};


