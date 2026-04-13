const express = require('express');
const User = require('../models/User');
const Land = require('../models/Land');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const blockchainService = require('../services/blockchainService');

const router = express.Router();

// GET /api/admin/users
router.get('/users', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, verified } = req.query;

    const query = {};
    if (role) query.roles = role;
    if (verified !== undefined) query.isVerified = verified === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/admin/users/:walletAddress/verify
router.put('/users/:walletAddress/verify', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { walletAddress: req.params.walletAddress },
      { isVerified: true, verifiedAt: new Date() },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create notification
    await Notification.create({
      walletAddress: req.params.walletAddress,
      type: 'account_verified',
      message: 'Your account has been verified by an administrator',
      isRead: false
    });

    res.json({ user });
  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

// PUT /api/admin/users/:walletAddress/role
router.put('/users/:walletAddress/role', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { role, action } = req.body; // action: 'add' or 'remove'

    if (!['inspector', 'moderator'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findOne({ walletAddress: req.params.walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (action === 'add') {
      if (!user.roles.includes(role)) {
        user.roles.push(role);
      }
    } else if (action === 'remove') {
      user.roles = user.roles.filter(r => r !== role);
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    await user.save();

    // Create notification
    await Notification.create({
      walletAddress: req.params.walletAddress,
      type: 'role_updated',
      message: `Your role has been ${action === 'add' ? 'granted' : 'revoked'}: ${role}`,
      isRead: false
    });

    res.json({ user: user.toObject({ getters: true }) });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// GET /api/admin/lands
router.get('/lands', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, verified, forSale } = req.query;

    const query = {};
    if (verified !== undefined) query.isVerified = verified === 'true';
    if (forSale !== undefined) query.isForSale = forSale === 'true';

    const lands = await Land.find(query)
      .populate('owner', 'walletAddress name')
      .sort({ registeredAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Land.countDocuments(query);

    res.json({
      lands,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get lands error:', error);
    res.status(500).json({ error: 'Failed to fetch lands' });
  }
});

// PUT /api/admin/lands/:landId/verify
router.put('/lands/:landId/verify', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const landId = parseInt(req.params.landId);

    // Verify on blockchain
    const result = await blockchainService.verifyLandOnChain(landId, process.env.ADMIN_PRIVATE_KEY);

    // Update MongoDB
    const land = await Land.findOneAndUpdate(
      { landId },
      { isVerified: true, lastUpdated: new Date() },
      { new: true }
    );

    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }

    // Create transaction record
    await Transaction.create({
      txHash: result.txHash,
      type: 'verify',
      landId,
      to: req.user.walletAddress,
      status: 'confirmed',
      timestamp: new Date()
    });

    // Notify owner
    await Notification.create({
      walletAddress: land.owner,
      type: 'land_verified',
      message: `Your land "${land.title}" has been verified`,
      landId,
      isRead: false
    });

    res.json({ land, txHash: result.txHash });
  } catch (error) {
    console.error('Verify land error:', error);
    res.status(500).json({ error: 'Failed to verify land' });
  }
});

// GET /api/admin/stats
router.get('/stats', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const totalLands = await Land.countDocuments();
    const verifiedLands = await Land.countDocuments({ isVerified: true });
    const landsForSale = await Land.countDocuments({ isForSale: true });
    const totalTransactions = await Transaction.countDocuments();
    const pendingTransfers = await Transaction.countDocuments({ type: 'transfer', status: 'pending' });

    res.json({
      users: {
        total: totalUsers,
        verified: verifiedUsers,
        unverified: totalUsers - verifiedUsers
      },
      lands: {
        total: totalLands,
        verified: verifiedLands,
        unverified: totalLands - verifiedLands,
        forSale: landsForSale
      },
      transactions: {
        total: totalTransactions,
        pendingTransfers
      }
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

// DELETE /api/admin/users/:walletAddress
router.delete('/users/:walletAddress', auth, roleCheck(['admin']), async (req, res) => {
  try {
    // Only allow deletion of unverified users
    const user = await User.findOne({ walletAddress: req.params.walletAddress });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Cannot delete verified users' });
    }

    await User.findOneAndDelete({ walletAddress: req.params.walletAddress });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;