const express = require('express');
const router = express.Router();
const{
    createWallet,
    getWallets,
    
}=require('../controllers/walletController');

// Middleware to check if user is authenticated

router.post('/', createWallet);
router.get('/', getWallets);

module.exports = router;