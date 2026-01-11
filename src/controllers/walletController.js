const Wallet = require("../models/Wallet");
const Plan = require("../models/Plan");
const Investment = require("../models/Investment");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const ensureWallet = async (userId) => {
  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = await Wallet.create({ user: userId, balance: 0 });
  }
  return wallet;
};

const buyPlan = async (req, res) => {
  try {
    const { userId, planId } = req.body;

    if (!userId || !planId) {
      return res.status(400).json({ message: "userId and planId are required" });
    }

    const plan = await Plan.findById(planId);
    if (!plan || !plan.isActive) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const wallet = await ensureWallet(userId);

    if (wallet.balance < plan.investAmount) {
      return res.status(400).json({ message: "Insufficient wallet balance" });
    }

    wallet.balance -= plan.investAmount;
    await wallet.save();

    const investment = await Investment.create({
      user: userId,
      plan: plan._id,
      investAmount: plan.investAmount,
      dailyIncome: plan.dailyIncome,
      durationDays: plan.durationDays,
      totalIncome: plan.totalIncome,
      daysCompleted: 0,
      isActive: true,
    });

    await Transaction.create({
      user: userId,
      type: "plan_buy",
      amount: plan.investAmount,
      status: "success",
      meta: { planId: plan._id },
    });

    res.status(201).json({
      message: "Plan purchased successfully",
      investment,
      walletBalance: wallet.balance,
    });
  } catch (err) {
    console.error("Buy plan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const getWalletInfo = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
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

module.exports = { buyPlan, getWalletInfo, getTeamInfo, getUserTransactions };
