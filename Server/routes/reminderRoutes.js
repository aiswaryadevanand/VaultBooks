const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { checkRole } = require('../middlewares/roleMiddleware');

const {
createReminder,
getReminders,
updateReminder,
deleteReminder,
} = require('../controllers/reminderController');

router.use(auth); // Protect all routes

// Anyone with access (including viewer) can read reminders
router.get('/:walletId', getReminders);

// Only owner/editor can create, update, delete
router.post('/', checkRole(['accountant']), createReminder);
router.put('/:id', checkRole(['accountant']), updateReminder);
router.delete('/:id', checkRole(['accountant']), deleteReminder);

module.exports = router;
