const express = require('express');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

// GET /api/transactions
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, landId } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;
    if (landId) query.landId = parseInt(landId);

    // Users can only see their own transactions unless they're admin
    if (!req.user.roles.includes('admin')) {
      query.$or = [
        { from: req.user.walletAddress },
        { to: req.user.walletAddress }
      ];
    }

    const transactions = await Transaction.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('landId', 'title location');

    const total = await Transaction.countDocuments(query);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// GET /api/transactions/:txHash
router.get('/:txHash', auth, async (req, res) => {
  try {
    const transaction = await Transaction.findOne({ txHash: req.params.txHash })
      .populate('landId', 'title location owner');

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check if user has permission to view this transaction
    if (!req.user.roles.includes('admin') &&
        transaction.from !== req.user.walletAddress &&
        transaction.to !== req.user.walletAddress) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

// GET /api/transactions/stats
router.get('/stats/summary', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const stats = await Transaction.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalValue: {
            $sum: {
              $cond: [
                { $in: ['$type', ['sale', 'list']] },
                { $toDouble: '$amount' },
                0
              ]
            }
          }
        }
      }
    ]);

    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    const confirmedTransactions = await Transaction.countDocuments({ status: 'confirmed' });

    res.json({
      totalTransactions,
      pendingTransactions,
      confirmedTransactions,
      byType: stats
    });
  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({ error: 'Failed to fetch transaction stats' });
  }
});

module.exports = router;