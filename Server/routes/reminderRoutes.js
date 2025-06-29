const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { checkWalletRole } = require('../middlewares/roleMiddleware');

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
router.post('/', checkWalletRole(['accountant']), createReminder);
router.put('/:id', checkWalletRole(['accountant']), updateReminder);
router.delete('/:id', checkWalletRole(['accountant']), deleteReminder);

module.exports = router;
