const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); 
const {checkWalletRole} = require('../middlewares/roleMiddleware'); 
const {getWalletDetailsWithRoleCheck}= require('../controllers/walletController'); 
// Importing the wallet controller functions
const{
    createWallet,
    getWallets,
    updateWallet,
    deleteWallet,
    inviteUser,
    getTeamMembers,
    updateMemberRole,
    removeMember
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
router.put('/:walletId/members/:memberId', checkWalletRole(['owner']), updateMemberRole);
router.delete('/:walletId/members/:memberId', checkWalletRole(['owner']), removeMember);



module.exports = router;