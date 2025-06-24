const Wallet = require('../models/Wallet');

exports.createWallet = async (req, res) => {
    try {
        const { name, type } = req.body;

        const userId =  '60a7c1f96e1f4b3a68a68d6b'; // Assuming user ID is stored in req.user

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
            const userId =  '60a7c1f96e1f4b3a68a68d6b'; // Assuming user ID is stored in req.user
            const wallets = await Wallet.find({ members: userId });
            res.status(200).json(wallets);
        } catch (err) {
            res.status(500).json({ error: 'Error fetching wallets', details: err.message });
        }
    };