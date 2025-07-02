const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); // Assuming you have an auth middleware
const {checkWalletRole} = require('../middlewares/roleMiddleware'); // Assuming you have a role middleware
const {getWalletDetailsWithRoleCheck}= require('../controllers/walletController'); // Middleware to get wallet details and check role
// Importing the wallet controller functions
const{
    createWallet,
    getWallets,
    updateWallet,
    deleteWallet,
    inviteUser,
    getTeamMembers
    
}=require('../controllers/walletController');

// Middleware to check if user is authenticated
router.use(authMiddleware);

router.post('/', createWallet);

router.get('/', getWallets);
router.put('/:id', updateWallet);
router.delete('/:id', deleteWallet);
router.post('/:walletId/invite', inviteUser);
router.get('/:walletId/team', getTeamMembers);
router.get('/:walletId/secure',checkWalletRole(['owner', 'accountant']), getWalletDetailsWithRoleCheck); // Get wallet details with role check


module.exports = router;