const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cron = require("node-cron");

const connectDB = require("./src/config/db");
const routes = require("./src/routes");

dotenv.config();

const app = express();

/* =======================
   MIDDLEWARES
======================= */
app.use(express.json());

// CORS configuration - allow both production and development
const allowedOrigins = [
  process.env.CLIENT_URL,   // Production domain (later)
  'http://localhost:5173',  // Vite dev
  'http://localhost:4173',  // Vite preview (IMPORTANT)
  'http://localhost:3000',  // Backend same-origin
];


app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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
    const Investment = require("./src/models/Investment");
    const Wallet = require("./src/models/Wallet");
    const Transaction = require("./src/models/Transaction");

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
