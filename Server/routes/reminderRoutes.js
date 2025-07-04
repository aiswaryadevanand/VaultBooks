const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { checkWalletRole } = require('../middlewares/roleMiddleware');

const {
createReminder,
getReminders,
updateReminder,
deleteReminder,
getDueReminders
} = require('../controllers/reminderController');

router.use(auth); 
router.get('/due', getDueReminders);
// Anyone with access (including viewer) can read reminders
router.get('/:walletId', getReminders);

// Only owner/editor can create, update, delete
router.post('/', checkWalletRole(['owner', 'accountant']), createReminder);
router.put('/:id', checkWalletRole(['owner', 'accountant']), updateReminder);
router.delete('/:id', checkWalletRole(['owner']), deleteReminder); // Only owner can delete


module.exports = router;
