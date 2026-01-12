const Plan = require("../models/Plan");

// one-time seed endpoint
const seedPlans = async (req, res) => {
  try {
    const existing = await Plan.countDocuments();
    if (existing > 0) {
      return res.status(400).json({ message: "Plans already seeded" });
    }

    const plans = [
      { name: "Plan 1", investAmount: 999, dailyIncome: 80, durationDays: 99, totalIncome: 7920 },
      { name: "Plan 2", investAmount: 3000, dailyIncome: 400, durationDays: 99, totalIncome: 39600 },
      { name: "Plan 3", investAmount: 5000, dailyIncome: 800, durationDays: 99, totalIncome: 79200 },
      { name: "Plan 4", investAmount: 8000, dailyIncome: 2000, durationDays: 99, totalIncome: 198000 },
      { name: "Plan 5", investAmount: 12000, dailyIncome: 3600, durationDays: 99, totalIncome: 356400 },
      { name: "Plan 6", investAmount: 20000, dailyIncome: 8000, durationDays: 99, totalIncome: 792000 },
      { name: "Plan 7", investAmount: 30000, dailyIncome: 15000, durationDays: 99, totalIncome: 1485000 },
      { name: "Plan 8", investAmount: 50000, dailyIncome: 35000, durationDays: 99, totalIncome: 3465000 },
    ];

    const created = await Plan.insertMany(plans);
    res.status(201).json({ message: "Plans seeded", plans: created });
  } catch (err) {
    console.error("Seed plans error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ investAmount: 1 });
    res.json(plans);
  } catch (err) {
    console.error("Get plans error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { seedPlans, getPlans };
