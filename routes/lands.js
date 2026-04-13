const express = require('express');
const { body, validationResult, query } = require('express-validator');
const multer = require('multer');
const Land = require('../models/Land');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { blockchainLimiter } = require('../middleware/rateLimiter');
const blockchainService = require('../services/blockchainService');
const ipfsService = require('../services/ipfsService');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// GET /api/lands
router.get('/', async (req, res) => {
  try {
    const {
      owner,
      verified,
      forSale,
      type,
      district,
      page = 1,
      limit = 10
    } = req.query;

    const query = {};
    if (owner) query.owner = owner.toLowerCase();
    if (verified !== undefined) query.isVerified = verified === 'true';
    if (forSale !== undefined) query.isForSale = forSale === 'true';
    if (type) query.landType = type;
    if (district) query.district = district;

    const lands = await Land.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('owner', 'name walletAddress');

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

// GET /api/lands/:landId
router.get('/:landId', async (req, res) => {
  try {
    const landId = parseInt(req.params.landId);
    const land = await Land.findOne({ landId });

    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }

    // Get owner details
    const owner = await User.findOne({ walletAddress: land.owner });

    // Get transaction history
    const transactions = await Transaction.find({ landId })
      .sort({ timestamp: -1 })
      .limit(20);

    res.json({
      land,
      owner: owner ? {
        walletAddress: owner.walletAddress,
        name: owner.name,
        isVerified: owner.isVerified
      } : null,
      transactions
    });
  } catch (error) {
    console.error('Get land error:', error);
    res.status(500).json({ error: 'Failed to fetch land details' });
  }
});

// POST /api/lands/upload - Upload document to IPFS
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    console.log('📤 Upload attempt:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      timestamp: new Date().toISOString()
    });

    // Upload to IPFS
    const ipfsHash = await ipfsService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    console.log('✅ Document upload successful:', ipfsHash);

    res.json({
      success: true,
      hash: ipfsHash,
      ipfsHash: ipfsHash,
      filename: req.file.originalname,
      mimeType: req.file.mimetype
    });
  } catch (error) {
    console.error('❌ Document upload error:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    res.status(500).json({ 
      error: 'Failed to upload document to IPFS',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// POST /api/lands/register
router.post('/register', auth, roleCheck(['registrar']), blockchainLimiter, upload.single('document'), [
  body('title').isString().notEmpty(),
  body('location').isString().notEmpty(),
  body('areaSqFt').isNumeric().isInt({ min: 1 }),
  body('district').isString().notEmpty(),
  body('state').isString().notEmpty(),
  body('pincode').isString().notEmpty(),
  body('landType').isIn(['agricultural', 'residential', 'commercial', 'industrial'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Document file is required' });
    }

    const { title, location, areaSqFt, district, state, pincode, landType } = req.body;

    // Upload document to IPFS
    const docHash = await ipfsService.uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Register on blockchain
    const result = await blockchainService.registerLandOnChain(
      title,
      location,
      parseInt(areaSqFt),
      docHash,
      process.env.REGISTRAR_PRIVATE_KEY // This should be set securely
    );

    // Save to MongoDB
    const land = new Land({
      landId: Date.now(), // Simple ID generation, should be improved
      title,
      location,
      areaSqFt: parseInt(areaSqFt),
      owner: req.user.walletAddress,
      registeredBy: req.user.walletAddress,
      isVerified: false,
      isForSale: false,
      documentHash: docHash,
      documentUrl: ipfsService.getGatewayUrl(docHash),
      district,
      state,
      pincode,
      landType,
      registeredAt: new Date()
    });

    await land.save();

    res.json({
      message: 'Land registered successfully',
      landId: land.landId,
      txHash: result.txHash
    });
  } catch (error) {
    console.error('Register land error:', error);
    res.status(500).json({ error: 'Failed to register land' });
  }
});

// POST /api/lands/:landId/verify
router.post('/:landId/verify', auth, roleCheck(['inspector']), blockchainLimiter, async (req, res) => {
  try {
    const landId = parseInt(req.params.landId);
    const land = await Land.findOne({ landId });

    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }

    // Verify on blockchain
    const result = await blockchainService.verifyLandOnChain(
      landId,
      process.env.INSPECTOR_PRIVATE_KEY
    );

    // Update MongoDB
    land.isVerified = true;
    land.lastUpdated = new Date();
    await land.save();

    // Create notification
    await notificationService.createNotification(
      land.owner,
      'land_verified',
      `Your land "${land.title}" has been verified`,
      landId
    );

    res.json({
      message: 'Land verified successfully',
      txHash: result.txHash
    });
  } catch (error) {
    console.error('Verify land error:', error);
    res.status(500).json({ error: 'Failed to verify land' });
  }
});

// POST /api/lands/:landId/list-for-sale
router.post('/:landId/list-for-sale', auth, blockchainLimiter, [
  body('priceInEth').isNumeric().isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const landId = parseInt(req.params.landId);
    const { priceInEth } = req.body;

    const land = await Land.findOne({ landId });
    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }

    if (land.owner.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Only land owner can list for sale' });
    }

    // Convert ETH to Wei
    const priceInWei = ethers.parseEther(priceInEth.toString());

    // List on blockchain
    const result = await blockchainService.listForSaleOnChain(
      landId,
      priceInWei,
      process.env.OWNER_PRIVATE_KEY // Should be derived from user's wallet
    );

    // Update MongoDB
    land.isForSale = true;
    land.salePrice = priceInEth.toString();
    land.lastUpdated = new Date();
    await land.save();

    res.json({
      message: 'Land listed for sale successfully',
      txHash: result.txHash
    });
  } catch (error) {
    console.error('List for sale error:', error);
    res.status(500).json({ error: 'Failed to list land for sale' });
  }
});

// POST /api/lands/:landId/delist
router.post('/:landId/delist', auth, blockchainLimiter, async (req, res) => {
  try {
    const landId = parseInt(req.params.landId);
    const land = await Land.findOne({ landId });

    if (!land) {
      return res.status(404).json({ error: 'Land not found' });
    }

    if (land.owner.toLowerCase() !== req.user.walletAddress.toLowerCase()) {
      return res.status(403).json({ error: 'Only land owner can delist' });
    }

    // Delist on blockchain
    const result = await blockchainService.delistFromSaleOnChain(
      landId,
      process.env.OWNER_PRIVATE_KEY
    );

    // Update MongoDB
    land.isForSale = false;
    land.salePrice = null;
    land.lastUpdated = new Date();
    await land.save();

    res.json({
      message: 'Land delisted successfully',
      txHash: result.txHash
    });
  } catch (error) {
    console.error('Delist error:', error);
    res.status(500).json({ error: 'Failed to delist land' });
  }
});

module.exports = router;