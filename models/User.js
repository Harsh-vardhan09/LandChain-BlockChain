const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: String,
    email: String,
    phone: String,
    aadharNumber: String, // encrypted
    role: {
      type: String,
      enum: ['admin', 'registrar', 'inspector', 'user'],
      default: 'user'
    },
    isVerified: Boolean,
    profilePhoto: String,
    createdAt: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
