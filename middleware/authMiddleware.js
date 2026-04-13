const User = require("../models/User");

/**
 * Authentication middleware that extracts wallet address from request headers
 * and fetches the user's role from the database
 */
const authMiddleware = async (req, res, next) => {
  try {
    const walletAddress = req.headers["x-wallet-address"];

    if (!walletAddress) {
      return res
        .status(401)
        .json({ error: "Wallet address is required in headers (x-wallet-address)" });
    }

    const normalizedAddress = walletAddress.toLowerCase();

    // Fetch user from database
    let user = await User.findOne({ walletAddress: normalizedAddress });

    if (!user) {
      // Create user if doesn't exist (first login)
      user = await User.create({
        walletAddress: normalizedAddress,
        role: "user",
      });
    }

    // Attach user info to request
    req.user = {
      walletAddress: user.walletAddress,
      role: user.role,
      userId: user._id,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
};

module.exports = authMiddleware;
