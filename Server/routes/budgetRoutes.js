const express= require('express');
const router= express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware
const {
    createBudget,
    getBudgets,
    updateBudget,
    deleteBudget
} = require('../controllers/budgetController');

// Middleware to check if user is authenticated
router.use(authMiddleware);   
// Create a new budget
router.post('/', createBudget);   
// Get budgets for a specific wallet
router.get('/:walletId', getBudgets);
// Update a budget by ID
router.put('/:id', updateBudget);
// Delete a budget by ID    
router.delete('/:id', deleteBudget);

module.exports = router;    