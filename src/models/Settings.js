const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema({
    upiId: { type: String, default: "tradeindia@upi" },
    qrCodeUrl: { type: String, default: "" }, // Could be a URL or base64
});

const Settings = mongoose.model("Settings", settingsSchema);

module.exports = Settings;
