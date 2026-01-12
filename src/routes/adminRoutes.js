const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const planController = require("../controllers/planController");

router.get("/users", adminController.getUsers);
router.put("/users/:userId/block", adminController.toggleUserBlock);
router.post("/add-amount", adminController.addAmountToWallet);
router.get("/pending-transactions", adminController.getPendingTransactions);
router.post("/approve-recharge/:txId", adminController.approveRecharge);
router.post("/approve-withdrawal/:txId", adminController.approveWithdrawal);
router.get("/settings", adminController.getSettings);
router.post("/settings", adminController.updateSettings);

// Plan Management
router.post("/plans", planController.createPlan);
router.put("/plans/:planId", planController.updatePlan);
router.delete("/plans/:planId", planController.deletePlan);

module.exports = router;
