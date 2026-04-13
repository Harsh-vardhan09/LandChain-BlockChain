# 🚀 Land Management System - Quick Start Guide

## Prerequisites

Before running the project, ensure you have:

1. **Node.js 16+** installed
2. **MongoDB** running locally or connection string
3. **Web3.Storage API token** (for IPFS uploads)
4. **MetaMask** browser extension

## ⚡ Quick Start Commands

### Option 1: One-Command Full Setup (Recommended)

**For Windows:**
```bash
# Run everything automatically
start-all.bat
```

**For Linux/Mac:**
```bash
# Make executable and run
chmod +x start-all.sh
./start-all.sh
```

### Option 2: Manual Step-by-Step

```bash
# 1. Install all dependencies
npm run install:all

# 2. Compile smart contract
npm run compile

# 3. Start local blockchain (in new terminal)
npx hardhat node

# 4. Deploy contract (in new terminal)
npm run deploy

# 5. Start backend server (in new terminal)
npm start

# 6. Start frontend (in new terminal)
cd frontend && npm run dev
```

### Option 3: Development Mode

```bash
# Compile and deploy, then start backend
npm run dev
```

## 🌐 Access Points

After starting all services:

- **Frontend App**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Local Blockchain**: http://127.0.0.1:8545
- **MongoDB**: localhost:27017 (default)

## 🔧 Initial Setup

### 1. MetaMask Configuration

1. Open MetaMask extension
2. Click network dropdown → "Add Network"
3. Add Localhost 8545:
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://127.0.0.1:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH

### 2. Import Test Account

1. In the terminal running `npx hardhat node`, copy a private key
2. In MetaMask: "Import Account" → paste private key
3. This account will have test ETH for transactions

### 3. Set First Admin User

1. Register a land through the frontend
2. Connect to MongoDB and set user role to "admin":

```javascript
// In MongoDB shell or MongoDB Compass
db.users.updateOne(
  { walletAddress: "0xyouraddress" },
  { $set: { role: "admin" } }
)
```

## 📋 Environment Variables (.env)

Create `.env` file in root directory:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/land-management

# Blockchain
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=deployed_contract_address

# IPFS (Get from https://web3.storage/)
WEB3_STORAGE_TOKEN=your_web3_storage_token

# Server
PORT=3000
```

## 🛠️ Troubleshooting

### "Command not found" errors
```bash
# Install dependencies first
npm run install:all
```

### MongoDB connection issues
```bash
# Start MongoDB service (Windows)
net start MongoDB

# Or install MongoDB and start
mongod --dbpath /path/to/db
```

### Smart contract deployment fails
```bash
# Ensure Hardhat node is running
npx hardhat node

# Check PRIVATE_KEY in .env
```

### Frontend not loading
```bash
# Check if port 5173 is available
# Try different port: cd frontend && npm run dev -- --port 3001
```

### IPFS uploads failing
```bash
# Check WEB3_STORAGE_TOKEN in .env
# Get token from: https://web3.storage/
```

## 🔄 Development Workflow

### Making Changes

1. **Smart Contract Changes**:
   ```bash
   npm run compile
   npm run deploy
   # Restart backend and frontend
   ```

2. **Backend Changes**:
   ```bash
   # Server auto-restarts with nodemon
   ```

3. **Frontend Changes**:
   ```bash
   # Hot reload enabled
   ```

### Testing

```bash
# Run smart contract tests
npm test

# Run with coverage
npx hardhat coverage
```

## 📊 Monitoring

### Check Services Status

```bash
# Check if ports are listening
netstat -an | findstr :3000  # Backend
netstat -an | findstr :5173  # Frontend
netstat -an | findstr :8545  # Blockchain
```

### View Logs

- **Backend**: Check terminal running `npm start`
- **Frontend**: Check terminal running `npm run dev`
- **Blockchain**: Check terminal running `npx hardhat node`

### Database

```bash
# Connect to MongoDB
mongo
use land-management
db.users.find()
db.lands.find()
```

## 🚀 Production Deployment

For production deployment:

1. **Build frontend**:
   ```bash
   npm run build:frontend
   ```

2. **Set production environment variables**
3. **Deploy to cloud provider** (AWS, Vercel, etc.)
4. **Use production blockchain** (testnet/mainnet)
5. **Set up production MongoDB** (MongoDB Atlas)

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Review error messages in terminal
3. Check `.env` configuration
4. Ensure all prerequisites are installed
5. Check the README_ENHANCED.md for detailed docs

---

**Happy coding! 🎉**