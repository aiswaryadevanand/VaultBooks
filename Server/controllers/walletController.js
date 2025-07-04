const Wallet = require('../models/Wallet');
const User = require('../models/User');
const logAudit = require('../utils/logAudit');

// Create Wallet
exports.createWallet = async (req, res) => {
  try {
    const { name, type } = req.body;
    const userId = req.user.userId;

    const newWallet = new Wallet({
      name,
      type,
      createdBy: userId,
      members: [],
    });

    const savedWallet = await newWallet.save();

    await logAudit({
      userId,
      walletId: savedWallet._id,
      action: 'create-wallet',
      details: { name, type },
    });

    res.status(201).json(savedWallet);
  } catch (err) {
    res.status(500).json({ error: 'Error creating wallet', details: err.message });
  }
};

// Get All Wallets Accessible by User
exports.getWallets = async (req, res) => {
  try {
    const userId = req.user.userId;
    const wallets = await Wallet.find({
      $or: [
        { createdBy: userId },
        { members: { $elemMatch: { userId } } },
      ],
    }).populate("createdBy", "username email");

    res.status(200).json(wallets);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching wallets', details: err.message });
  }
};

// Update Wallet
exports.updateWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    if (wallet.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to update this wallet' });
    }

    wallet.name = req.body.name;
    wallet.type = req.body.type;
    const updated = await wallet.save();

    await logAudit({
      userId: req.user.userId,
      walletId: wallet._id,
      action: 'update-wallet',
      details: { name: wallet.name, type: wallet.type },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error updating wallet', details: err.message });
  }
};

// Delete Wallet
exports.deleteWallet = async (req, res) => {
  try {
    const wallet = await Wallet.findById(req.params.id);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    if (wallet.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Unauthorized to delete this wallet' });
    }

    await logAudit({
      userId: req.user.userId,
      walletId: wallet._id,
      action: 'delete-wallet',
      details: { name: wallet.name },
    });

    await wallet.deleteOne();
    res.json({ message: 'Wallet deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting wallet', details: err.message });
  }
};

// Invite User to Wallet
exports.inviteUser = async (req, res) => {
  const { walletId } = req.params;
  const { email, role, password } = req.body;

  try {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    if (wallet.createdBy.toString() !== req.user.userId)
      return res.status(403).json({ error: 'Only owner can invite users' });

    let invitedUser = await User.findOne({ email });
    let isNewUser = false;

    if (!invitedUser) {
      if (!password || password.length < 6) {
        return res.status(400).json({ error: 'Password is required for new user and should be at least 6 characters.' });
      }
      invitedUser = new User({
        username: email.split('@')[0],
        email,
        password
      });
      await invitedUser.save();
      isNewUser = true;
    }

    const alreadyInWallet =
      wallet.createdBy.toString() === invitedUser._id.toString() ||
      wallet.members.some(m => m.userId.toString() === invitedUser._id.toString());

    if (alreadyInWallet) {
      return res.status(400).json({ error: 'User already part of this wallet' });
    }

    wallet.members.push({ userId: invitedUser._id, role });
    await wallet.save();

    await logAudit({
      userId: req.user.userId,
      walletId: wallet._id,
      action: 'invite-user',
      details: { invitedEmail: email, role, isNewUser },
    });

    res.json({ message: 'User invited successfully', userId: invitedUser._id, isNewUser });
  } catch (err) {
    res.status(500).json({ error: 'Error inviting user', details: err.message });
  }
};

// Get Team Members
exports.getTeamMembers = async (req, res) => {
  try {
    const { walletId } = req.params;
    const userId = req.user.userId;

    const wallet = await Wallet.findById(walletId)
      .populate('members.userId', 'username email')
      .populate('createdBy', 'username email');

    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    const isOwner = wallet.createdBy._id?.toString() === userId;
    const isMember = wallet.members?.some(m => m.userId && m.userId._id?.toString() === userId);

    if (!isOwner && !isMember) {
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
      })),
    ];

    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Wallet Details With Role Check
exports.getWalletDetailsWithRoleCheck = async (req, res) => {
  const { walletId } = req.params;

  try {
    const wallet = await Wallet.findById(walletId).populate('createdBy', 'username email');
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    res.json({
      message: ` Access granted to wallet as ${req.userRole}`,
      wallet,
      userRole: req.userRole,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch wallet info', details: err.message });
  }
};


// Update Member Role
exports.updateMemberRole = async (req, res) => {
  const { walletId, memberId } = req.params;
  const { role } = req.body;

  try {
    const wallet = await Wallet.findById(walletId).populate('members.userId', 'email');
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    if (wallet.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only owner can update roles' });
    }

    const member = wallet.members.find(m => m.userId._id.toString() === memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    member.role = role;
    await wallet.save();

    await logAudit({
      userId: req.user.userId,
      walletId: wallet._id,
      action: 'update-role',
      details: {
        targetUser: member.userId.email,
        newRole: role,
        changedBy: req.user.email,
      },
    });

    res.json({ message: 'Role updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update role', details: err.message });
  }
};
//remove member
exports.removeMember = async (req, res) => {
  const { walletId, memberId } = req.params;

  try {
    const wallet = await Wallet.findById(walletId).populate('members.userId', 'email');
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });

    if (wallet.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Only owner can remove members' });
    }

    const member = wallet.members.find(m => m.userId._id.toString() === memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found or already removed' });
    }

    const removedEmail = member.userId.email;

    // Remove the member
    wallet.members = wallet.members.filter(m => m.userId._id.toString() !== memberId);
    await wallet.save();

    // Log the removal in audit logs
    await logAudit({
      userId: req.user.userId,
      walletId: wallet._id,
      action: 'remove-member',
      details: {
        removedEmail,
        removedBy: req.user.email,
      },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove member', details: err.message });
  }
};
