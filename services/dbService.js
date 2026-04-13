const Land = require("../models/Land");
const User = require("../models/User");

async function ensureUser(walletAddress, role = "user") {
  if (!walletAddress) {
    throw new Error("walletAddress is required");
  }

  const normalizedAddress = walletAddress.toLowerCase();
  return User.findOneAndUpdate(
    { walletAddress: normalizedAddress },
    { walletAddress: normalizedAddress, role },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

async function saveLand({ landId, location, area, owner, verified = false }) {
  if (!landId || !location || area == null || !owner) {
    throw new Error("landId, location, area, and owner are required to save land");
  }

  return Land.findOneAndUpdate(
    { landId: landId.toString() },
    {
      landId: landId.toString(),
      location,
      area: Number(area),
      owner: owner.toLowerCase(),
      verified,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean();
}

async function updateLandVerification(landId, verified = true) {
  if (!landId) {
    throw new Error("landId is required");
  }

  return Land.findOneAndUpdate(
    { landId: landId.toString() },
    { verified },
    { new: true }
  ).lean();
}

async function updateLandOwnership(landId, newOwner) {
  if (!landId || !newOwner) {
    throw new Error("landId and newOwner are required");
  }

  return Land.findOneAndUpdate(
    { landId: landId.toString() },
    { owner: newOwner.toLowerCase() },
    { new: true }
  ).lean();
}

async function getLandById(landId) {
  if (!landId) {
    throw new Error("landId is required");
  }

  return Land.findOne({ landId: landId.toString() }).lean();
}

module.exports = {
  ensureUser,
  saveLand,
  updateLandVerification,
  updateLandOwnership,
  getLandById,
};
