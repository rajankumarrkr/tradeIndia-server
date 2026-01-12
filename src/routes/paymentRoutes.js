const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

const adminController = require("../controllers/adminController");

router.post("/recharge", paymentController.createRecharge);
router.post("/withdraw", paymentController.createWithdrawal);
router.get("/settings", adminController.getSettings);

module.exports = router;
