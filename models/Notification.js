const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: mongoose.ObjectId,
    walletAddress: String,
    type: String,   // 'transfer_request', 'transfer_approved', 'land_verified', 'sale'
    message: String,
    landId: Number,
    isRead: Boolean,
    createdAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);