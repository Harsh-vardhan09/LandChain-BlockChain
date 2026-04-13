const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Land = require('../models/Land');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/users/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findOne({ walletAddress: req.user.walletAddress })
      .select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/users/profile
router.put('/profile', auth, [
  body('name').optional().isString().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail(),
  body('phone').optional().isMobilePhone(),
  body('address').optional().isString().trim().isLength({ min: 10, max: 200 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    const allowedFields = ['name', 'email', 'phone', 'address'];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findOneAndUpdate(
      { walletAddress: req.user.walletAddress },
      updates,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// GET /api/users/my-lands
router.get('/my-lands', auth, async (req, res) => {
  try {
    const lands = await Land.find({ owner: req.user.walletAddress })
      .sort({ registeredAt: -1 });

    res.json({ lands });
  } catch (error) {
    console.error('Get my lands error:', error);
    res.status(500).json({ error: 'Failed to fetch your lands' });
  }
});

// GET /api/users/notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    const query = { walletAddress: req.user.walletAddress };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PUT /api/users/notifications/:id/read
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, walletAddress: req.user.walletAddress },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// PUT /api/users/notifications/read-all
router.put('/notifications/read-all', auth, async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { walletAddress: req.user.walletAddress, isRead: false },
      { isRead: true }
    );

    res.json({ updatedCount: result.modifiedCount });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// DELETE /api/users/notifications/:id
router.delete('/notifications/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      walletAddress: req.user.walletAddress
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// GET /api/users/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const ownedLands = await Land.countDocuments({ owner: req.user.walletAddress });
    const verifiedLands = await Land.countDocuments({
      owner: req.user.walletAddress,
      isVerified: true
    });
    const landsForSale = await Land.countDocuments({
      owner: req.user.walletAddress,
      isForSale: true
    });
    const unreadNotifications = await Notification.countDocuments({
      walletAddress: req.user.walletAddress,
      isRead: false
    });

    res.json({
      ownedLands,
      verifiedLands,
      landsForSale,
      unreadNotifications
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

module.exports = router;