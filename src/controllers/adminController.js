const User = require("../models/User");
const Transaction = require("../models/Transaction");
const Wallet = require("../models/Wallet");
const Settings = require("../models/Settings");

// Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Block/unblock user
const toggleUserBlock = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ message: `User ${user.isBlocked ? "blocked" : "unblocked"}`, isBlocked: user.isBlocked });
  } catch (err) {
    console.error("Toggle block error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Add amount to wallet
const addAmountToWallet = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount) {
      return res.status(400).json({ message: "userId and amount required" });
    }
    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }
    wallet.balance += amount;
    await wallet.save();
    await Transaction.create({
      user: userId,
      type: "roi", // or admin_add
      amount,
      status: "success",
    });
    res.json({ message: "Amount added", balance: wallet.balance });
  } catch (err) {
    console.error("Add amount error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get pending transactions
const getPendingTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ status: "pending" }).populate("user", "name mobile").sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error("Get pending tx error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve recharge
const approveRecharge = async (req, res) => {
  try {
    const { txId } = req.params;
    const tx = await Transaction.findById(txId);
    if (!tx || tx.type !== "recharge" || tx.status !== "pending") {
      return res.status(400).json({ message: "Invalid transaction" });
    }
    tx.status = "success";
    await tx.save();

    const wallet = await Wallet.findOne({ user: tx.user });
    if (wallet) {
      wallet.balance += tx.amount;
      wallet.totalRecharge += tx.amount;
      await wallet.save();
    }

    // Team income: 10% to referrer
    const user = await User.findById(tx.user);
    if (user && user.referredBy) {
      const referrerWallet = await Wallet.findOne({ user: user.referredBy });
      if (referrerWallet) {
        const teamIncome = tx.amount * 0.1;
        referrerWallet.balance += teamIncome;
        referrerWallet.totalIncome += teamIncome;
        await referrerWallet.save();
        await Transaction.create({
          user: user.referredBy,
          type: "team_income",
          amount: teamIncome,
          status: "success",
          meta: { referredUser: tx.user },
        });
      }
    }

    res.json({ message: "Recharge approved" });
  } catch (err) {
    console.error("Approve recharge error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve withdrawal
const approveWithdrawal = async (req, res) => {
  try {
    const { txId } = req.params;
    const tx = await Transaction.findById(txId);
    if (!tx || tx.type !== "withdraw" || tx.status !== "pending") {
      return res.status(400).json({ message: "Invalid transaction" });
    }
    tx.status = "success";
    await tx.save();
    // Assume bank transfer done manually
    res.json({ message: "Withdrawal approved" });
  } catch (err) {
    console.error("Approve withdrawal error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Update settings
const updateSettings = async (req, res) => {
  try {
    const { upiId, qrCodeUrl } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ upiId, qrCodeUrl });
    } else {
      settings.upiId = upiId;
      settings.qrCodeUrl = qrCodeUrl;
    }
    await settings.save();
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getUsers,
  toggleUserBlock,
  addAmountToWallet,
  getPendingTransactions,
  approveRecharge,
  approveWithdrawal,
  getSettings,
  updateSettings
};