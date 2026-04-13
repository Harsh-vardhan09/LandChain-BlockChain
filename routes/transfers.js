const express = require('express');
const { body, validationResult } = require('express-validator');
const { ethers } = require('ethers');
const Land = require('../models/Land');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { blockchainLimiter } = require('../middleware/rateLimiter');
const blockchainService = require('../services/blockchainService');
const notificationService = require('../services/notificationService');

const router = express.Router();

// POST /api/transfers/request
router.post('/request', auth, blockchainLimiter, [
  body('landId').isNumeric(),
  body('toAddress').isEthereumAddress(),
  body('reason').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { landId, toAddress, reason } = req.body;
    const land = await Land.findOne({ landId: parseInt(landId) });

    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }

    if (land.owner.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Only land owner can request transfer' });
    }

    if (toAddress.toLowerCase() === req.user.walletAddress.toLowerCase()) {
      return res.status(400).json({ error: 'Cannot transfer to yourself' });
    }

    // Request transfer on blockchain
    const result = await blockchainService.requestTransferOnChain(
      parseInt(landId),
      toAddress,
      reason,
      process.env.OWNER_PRIVATE_KEY
    );

    // Create transaction record
    await Transaction.create({
      txHash: result.txHash,
      type: 'transfer',
      landId: parseInt(landId),
      from: req.user.walletAddress,
      to: toAddress,
      status: 'pending',
      timestamp: new Date(),
      metadata: { reason, requestId: Date.now() } // Should get actual requestId from event
    });

    // Notify recipient
    await notificationService.createNotification(
      toAddress,
      'transfer_request',
      `You have received a transfer request for land "${land.title}"`,
      parseInt(landId)
    );

    res.json({
      message: 'Transfer request submitted successfully',
      txHash: result.txHash
    });
  } catch (error) {
    console.error('Transfer request error:', error);
    res.status(500).json({ error: 'Failed to request transfer' });
  }
});

// POST /api/transfers/:requestId/approve
router.post('/:requestId/approve', auth, roleCheck(['admin']), blockchainLimiter, async (req, res) => {
  try {
    const requestId = parseInt(req.params.requestId);

    // Find the transaction
    const transaction = await Transaction.findOne({
      'metadata.requestId': requestId,
      type: 'transfer',
      status: 'pending'
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transfer request not found' });
    }

    // Approve on blockchain
    const result = await blockchainService.approveTransferOnChain(
      requestId,
      process.env.ADMIN_PRIVATE_KEY
    );

    // Update transaction status
    transaction.status = 'confirmed';
    await transaction.save();

    // Update land ownership
    const land = await Land.findOne({ landId: transaction.landId });
    if (land) {
      land.owner = transaction.to;
      land.lastUpdated = new Date();
      await land.save();
    }

    // Notifications
    await notificationService.createNotification(
      transaction.from,
      'transfer_approved',
      `Your transfer request for land has been approved`,
      transaction.landId
    );

    await notificationService.createNotification(
      transaction.to,
      'transfer_approved',
      `Land has been transferred to you`,
      transaction.landId
    );

    res.json({
      message: 'Transfer approved successfully',
      txHash: result.txHash
    });
  } catch (error) {
    console.error('Approve transfer error:', error);
    res.status(500).json({ error: 'Failed to approve transfer' });
  }
});

// POST /api/transfers/:requestId/reject
router.post('/:requestId/reject', auth, roleCheck(['admin']), [
  body('reason').isString().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const requestId = parseInt(req.params.requestId);
    const { reason } = req.body;

    const transaction = await Transaction.findOne({
      'metadata.requestId': requestId,
      type: 'transfer',
      status: 'pending'
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transfer request not found' });
    }

    // Reject on blockchain
    const result = await blockchainService.rejectTransferOnChain(
      requestId,
      reason,
      process.env.ADMIN_PRIVATE_KEY
    );

    // Update transaction status
    transaction.status = 'failed';
    transaction.metadata.reason = reason;
    await transaction.save();

    // Notify requester
    await notificationService.createNotification(
      transaction.from,
      'transfer_rejected',
      `Your transfer request has been rejected: ${reason}`,
      transaction.landId
    );

    res.json({
      message: 'Transfer rejected successfully',
      txHash: result.txHash
    });
  } catch (error) {
    console.error('Reject transfer error:', error);
    res.status(500).json({ error: 'Failed to reject transfer' });
  }
});

// GET /api/transfers/pending
router.get('/pending', auth, roleCheck(['admin']), async (req, res) => {
  try {
    const pendingTransfers = await Transaction.find({
      type: 'transfer',
      status: 'pending'
    }).populate('landId', 'title location');

    res.json({ transfers: pendingTransfers });
  } catch (error) {
    console.error('Get pending transfers error:', error);
    res.status(500).json({ error: 'Failed to fetch pending transfers' });
  }
});

// GET /api/transfers/my-requests
router.get('/my-requests', auth, async (req, res) => {
  try {
    const requests = await Transaction.find({
      type: 'transfer',
      from: req.user.walletAddress
    }).sort({ timestamp: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: 'Failed to fetch transfer requests' });
  }
});

module.exports = router;