const express = require('express');
const { body, validationResult } = require('express-validator');
const { ethers } = require('ethers');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// POST /api/auth/connect-wallet
router.post('/connect-wallet', authLimiter, [
  body('walletAddress').isEthereumAddress(),
  body('signature').isString().notEmpty(),
  body('message').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { walletAddress, signature, message } = req.body;

    // Verify signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Find or create user
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });
    if (!user) {
      user = new User({ walletAddress: walletAddress.toLowerCase() });
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { walletAddress: user.walletAddress },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        walletAddress: user.walletAddress,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    console.error('Wallet connection error:', error);
    res.status(500).json({ error: 'Failed to connect wallet' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.user.walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      walletAddress: user.walletAddress,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      profilePhoto: user.profilePhoto,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

module.exports = router;