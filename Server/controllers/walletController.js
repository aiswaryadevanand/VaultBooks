const Wallet = require('../models/Wallet');
const User = require('../models/User');
 
exports.createWallet = async (req, res) => {
    try {
        const { name, type } = req.body;

        const userId =  req.user.userId; // Assuming user ID is stored in req.user

        const newWallet = new Wallet({
            name,
            type,
            createdBy: userId,
            members: [],
        });

        const savedWallet = await newWallet.save();
        res.status(201).json(savedWallet); 
        }catch (err) {
            res.status(500).json({ error: 'Error creating wallet', details: err.message });
        }
    };

    exports.getWallets = async (req, res) => {
        try {
            const userId =  req.user.userId; // Assuming user ID is stored in req.user
            const wallets = await Wallet.find({  $or: [
    { createdBy: userId },
    { members: { $elemMatch: { userId } } }
  ] });
            res.status(200).json(wallets);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching wallets', details: err.message });
        }
    };

    exports.updateWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // 🔐 Only the creator can update
    if (wallet.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to update this wallet' });
    }

    wallet.name = req.body.name;
    wallet.type = req.body.type;
    const updated = await wallet.save();

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error updating wallet', details: err.message });
  }
};
exports.deleteWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    // 🔐 Only the creator can delete
    if (wallet.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this wallet' });
    }

    await wallet.deleteOne();
    res.json({ message: 'Wallet deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting wallet', details: err.message });
  }
};


exports.inviteUser = async (req, res) => {
  const { walletId } = req.params;
  const { email, role, password } = req.body;

  try {
  const wallet = await Wallet.findById(walletId);
  if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

  // Only owner can invite
  if (wallet.createdBy.toString() !== req.user.userId)
    return res.status(403).json({ error: 'Only owner can invite users' });

  // Check if user already exists
  let invitedUser = await User.findOne({ email });
let isNewUser = false;

  // If not, create new user with a random password
  if (!invitedUser) {
    if (!password || password.length < 6) {
      return res.status(400).json({ error: 'Password is required for new user and should be at least 6 characters.' });
    }
    invitedUser = new User({
      username: email.split('@')[0], // basic username
      email,
      password // password will be hashed in pre-save hook
    });
    await invitedUser.save();
    isNewUser = true;
  }

  // Check if already in wallet
  const alreadyInWallet =
    wallet.createdBy.toString() === invitedUser._id.toString() ||
    wallet.members.some(m => m.userId.toString() === invitedUser._id.toString());

  if (alreadyInWallet) {
    return res.status(400).json({ error: 'User already part of this wallet' });
  }

  // Add to members
  wallet.members.push({ userId: invitedUser._id, role });
  await wallet.save();

  res.json({ message: 'User invited successfully', userId: invitedUser._id,isNewUser});
} catch (err) {
  res.status(500).json({ error: 'Error inviting user', details: err.message });
  }
};

exports.getTeamMembers = async (req, res) => {
  try {
    const { walletId } = req.params;
    const userId = req.user.userId;
    
    const wallet = await Wallet.findById(walletId)
  .populate('members.userId', 'username email')
  .populate('createdBy', 'username email');
  
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    

    const isOwner = wallet.createdBy._id?.toString() === userId;
const isMember = wallet.members?.some(
m => m.userId && m.userId._id?.toString() === userId
);


if (!isOwner && !isMember) {
  console.log("🚫 Access denied");
return res.status(403).json({ error: 'Unauthorized' });
}

    const team = [
  {
    userId: wallet.createdBy._id,
    username: wallet.createdBy.username,
    email: wallet.createdBy.email,
    role: 'owner',
  },
  ...wallet.members.map(m => ({
    userId: m.userId._id,
    username: m.userId.username,
    email: m.userId.email,
    role: m.role,
  }))
];


    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWalletDetailsWithRoleCheck = async (req, res) => {
  const { walletId } = req.params;

  try {
    const wallet = await Wallet.findById(walletId).populate('createdBy', 'username email');

    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    return res.json({
      message: `✅ Access granted to wallet as ${req.userRole}`,
      wallet,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wallet info', details: err.message });
  }
}
