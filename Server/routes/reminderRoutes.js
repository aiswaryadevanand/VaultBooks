const express = require('express');
const router = express.Router();
const auth=require('../middlewares/authMiddleware');
const{
    createReminder,
    getReminders,
    updateReminder,
    deleteReminder,
}= require('../controllers/reminderController');



router.use(auth); // Apply auth middleware to all routes

router.post('/', createReminder); // Create a new reminder
router.get('/:walletId', getReminders); // Get all reminders for the authenticated user
router.put('/:id', updateReminder); // Update a reminder by ID
router.delete('/:id', deleteReminder); // Delete a reminder by ID

module.exports = router;
