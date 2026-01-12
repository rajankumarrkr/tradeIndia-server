const mongoose = require("mongoose");
const Wallet = require("../models/Wallet");
const Plan = require("../models/Plan");
const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const ensureWallet = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    console.warn(`Invalid userId format: ${userId}`);
    return null;
  }
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0 });
  }
  return wallet;
};



const getWalletInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const wallet = await Wallet.findOne({ user: userId });
    if (!wallet) {
      return res.json({
        balance: 0,
        totalRecharge: 0,
        totalIncome: 0,
        error: "Wallet not initialized" // Optional debug info
      });
    }

    res.json({
      balance: wallet.balance,
      totalRecharge: wallet.totalRecharge,
      totalIncome: wallet.totalIncome,
    });
  } catch (err) {
    console.error("Get wallet info error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getTeamInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const teamSize = await User.countDocuments({ referredBy: userId });

    const teamIncomeResult = await Transaction.aggregate([
      { $match: { user: userId, type: "team_income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const teamIncome = teamIncomeResult[0]?.total || 0;

    res.json({ teamSize, teamIncome });
  } catch (err) {
    console.error("Get team info error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;
    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getWalletInfo, getTeamInfo, getUserTransactions };
