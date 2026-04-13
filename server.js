require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import services
const blockchainService = require('./services/blockchainService');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter, authLimiter, blockchainLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const landRoutes = require('./routes/lands');
const transferRoutes = require('./routes/transfers');
const transactionRoutes = require('./routes/transactions');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(morgan('combined'));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-wallet-address'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Rate limiting
app.use('/api/', apiLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/lands', landRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Database connection
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  throw new Error("MONGODB_URI environment variable is required");
}

mongoose
  .connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    // Initialize blockchain service
    blockchainService.initializeBlockchainService();
    console.log("✅ Blockchain service initialized");

    // Start event listeners
    blockchainService.listenToEvents();
    console.log("✅ Blockchain event listeners started");

    // Start server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`📚 API Documentation available at http://localhost:${port}/api`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
});