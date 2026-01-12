const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

router.post("/recharge", paymentController.createRecharge);
router.post("/withdraw", paymentController.createWithdrawal);

module.exports = router;
