const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const planController = require("../controllers/planController");
const walletController = require("../controllers/walletController");
const paymentController = require("../controllers/paymentController");
const bankAccountController = require("../controllers/bankAccountController");
const adminController = require("../controllers/adminController");


router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "TradeIndia API running" });
});

// auth
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

// plans
router.post("/plans/seed", planController.seedPlans);
router.get("/plans", planController.getPlans);
router.post("/plans/buy", walletController.buyPlan);

// wallet info
router.get("/wallet/:userId", walletController.getWalletInfo);
router.get("/team/:userId", walletController.getTeamInfo);

// payments
router.post("/recharge", paymentController.createRecharge);
router.post("/withdraw", paymentController.createWithdrawal);

// bank accounts
router.post("/bank-accounts", bankAccountController.addBankAccount);
router.get("/bank-accounts", bankAccountController.getBankAccounts);

// admin
router.get("/admin/users", adminController.getUsers);
router.put("/admin/users/:userId/block", adminController.toggleUserBlock);
router.post("/admin/add-amount", adminController.addAmountToWallet);
router.get("/admin/pending-transactions", adminController.getPendingTransactions);
router.post("/admin/approve-recharge/:txId", adminController.approveRecharge);
router.post("/admin/approve-withdrawal/:txId", adminController.approveWithdrawal);

// settings
router.get("/settings", adminController.getSettings);
router.post("/settings", adminController.updateSettings);

// User Transactions
router.get("/transactions/:userId", walletController.getUserTransactions);

module.exports = router;
