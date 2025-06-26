const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware
const{
    createWallet,
    getWallets,
    updateWallet,
    deleteWallet
    
}=require('../controllers/walletController');

// Middleware to check if user is authenticated
router.use(authMiddleware);

router.post('/', createWallet);
router.get('/', getWallets);
router.put('/:id', updateWallet);
router.delete('/:id', deleteWallet);

module.exports = router;