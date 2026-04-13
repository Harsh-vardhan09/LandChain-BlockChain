const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    txHash: String,
    type: { type: String, enum: ['register', 'verify', 'transfer', 'sale', 'list', 'delist'] },
    landId: Number,
    from: String,
    to: String,
    amount: String,
    blockNumber: Number,
    status: { type: String, enum: ['pending', 'confirmed', 'failed'] },
    timestamp: Date,
    gasUsed: String,
    metadata: Object   // extra data per tx type
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);