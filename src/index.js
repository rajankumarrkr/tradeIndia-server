const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");

const connectDB = require("./config/db");
const routes = require("./routes");

dotenv.config();

const app = express();

/* =======================
   MIDDLEWARES
======================= */
app.use(express.json());

app.use(
  cors({
    origin: process.env.CLIENT_URL, // frontend URL
    credentials: true,
  })
);

/* =======================
   DATABASE
======================= */
connectDB();

/* =======================
   ROUTES
======================= */
app.use("/api", routes);

app.get("/", (req, res) => {
  res.status(200).send("TradeIndia backend is running");
});

/* =======================
   DAILY ROI CRON JOB
   ⚠️ NOTE:
   Render free plan sleeps,
   so this is NOT 100% reliable
======================= */
cron.schedule("0 0 * * *", async () => {
  console.log("Running daily ROI job");

  try {
    const Investment = require("./models/Investment");
    const Wallet = require("./models/Wallet");
    const Transaction = require("./models/Transaction");

    const investments = await Investment.find({ isActive: true });

    for (const inv of investments) {
      const wallet = await Wallet.findOne({ user: inv.user });

      if (!wallet) continue;

      // credit ROI
      wallet.balance += inv.dailyIncome;
      wallet.totalIncome += inv.dailyIncome;
      await wallet.save();

      // transaction record
      await Transaction.create({
        user: inv.user,
        type: "roi",
        amount: inv.dailyIncome,
        status: "success",
        meta: { investmentId: inv._id },
      });

      // update investment
      inv.daysCompleted += 1;
      inv.lastCreditDate = new Date();

      if (inv.daysCompleted >= inv.durationDays) {
        inv.isActive = false;
      }

      await inv.save();
    }

    console.log("Daily ROI job completed successfully");
  } catch (error) {
    console.error("Daily ROI job failed:", error.message);
  }
});

/* =======================
   SERVER START
======================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
