const mongoose = require("mongoose");

const landSchema = new mongoose.Schema(
  {
    landId: { type: Number, unique: true, required: true },
    title: String,
    location: String,
    coordinates: { lat: Number, lng: Number }, // parsed from location string
    areaSqFt: Number,
    owner: String, // wallet address
    registeredBy: String, // wallet address
    isVerified: Boolean,
    isForSale: Boolean,
    salePrice: String, // in ETH (string to avoid float issues)
    documentHash: String, // IPFS hash
    documentUrl: String,
    district: String,
    state: String,
    pincode: String,
    landType: { type: String, enum: ['agricultural', 'residential', 'commercial', 'industrial'] },
    registeredAt: Date,
    lastUpdated: Date
  },
  { timestamps: true }
);

module.exports = mongoose.model("Land", landSchema);
