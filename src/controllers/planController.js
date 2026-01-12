const Plan = require("../models/Plan");

const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ investAmount: 1 });
    res.json(plans);
  } catch (err) {
    console.error("Get plans error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const createPlan = async (req, res) => {
  try {
    const { name, investAmount, dailyIncome, durationDays, totalIncome } = req.body;
    const newPlan = new Plan({
      name,
      investAmount,
      dailyIncome,
      durationDays,
      totalIncome: totalIncome || dailyIncome * durationDays,
    });
    await newPlan.save();
    res.status(201).json({ message: "Plan created successfully", plan: newPlan });
  } catch (err) {
    console.error("Create plan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updatePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const updatedPlan = await Plan.findByIdAndUpdate(planId, req.body, { new: true });
    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json({ message: "Plan updated successfully", plan: updatedPlan });
  } catch (err) {
    console.error("Update plan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const deletePlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const deletedPlan = await Plan.findByIdAndDelete(planId);
    if (!deletedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }
    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    console.error("Delete plan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPlans, createPlan, updatePlan, deletePlan };
