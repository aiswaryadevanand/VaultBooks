const Wallet = require('../models/Wallet');

exports.createWallet = async (req, res) => {
    try {
        const { name, type } = req.body;

        const userId =  req.user.userId; // Assuming user ID is stored in req.user

        const newWallet = new Wallet({
            name,
            type,
            createdBy: userId,
            members: [userId],
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
            const wallets = await Wallet.find({ members: userId });
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