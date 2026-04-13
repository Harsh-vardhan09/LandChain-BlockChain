# 🚀 Starting & Stopping the Land Management Project

## Quick Commands

### ✅ **START ALL SERVICES**

**Windows:**
```bash
start-all.bat
```

**Linux/Mac:**
```bash
./start-all.sh
```

### 🛑 **STOP ALL SERVICES**

**Windows:**
```bash
stop-all.bat
```

**Linux/Mac:**
```bash
./stop-all.sh
```

---

## 📋 What Gets Started

Running the start scripts will automatically:

1. ✅ Kill any existing processes on ports 8545, 3000, 5173, 5174
2. 🌐 Start Hardhat local blockchain (port 8545)
3. 📦 Deploy the smart contract
4. 🖥️ Start the backend server (port 3000)
5. 🎨 Start the frontend dev server (port 5173)
6. 📜 Create logs for each service in `logs/` directory

---

## 📍 Service URLs After Starting

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:5173 | Web interface |
| **Backend API** | http://localhost:3000 | REST API |
| **Blockchain** | http://127.0.0.1:8545 | Local Hardhat node |

---

## 📜 Logs

All services write logs to the `logs/` directory:

```
logs/
├── hardhat.log     # Blockchain node logs
├── deploy.log      # Contract deployment logs
├── backend.log     # Backend server logs
└── frontend.log    # Frontend dev server logs
```

View logs (Linux/Mac):
```bash
tail -f logs/backend.log
tail -f logs/frontend.log
```

---

## 🔧 Manual Start (Step-by-Step)

If you prefer to start services individually:

### Terminal 1: Start Blockchain
```bash
npx hardhat node
```

### Terminal 2: Deploy Contract
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Terminal 3: Start Backend
```bash
npm start
```

### Terminal 4: Start Frontend
```bash
cd frontend
npm run dev
```

---

## 🛑 Manual Stop

Kill specific services:

**Windows:**
```bash
# Kill all Node processes
taskkill /IM node.exe /F

# Kill specific port
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# Kill all Node processes
pkill -f node

# Kill specific port
lsof -ti:3000 | xargs kill -9
```

Kill all at once:

**Windows:**
```bash
stop-all.bat
```

**Linux/Mac:**
```bash
./stop-all.sh
```

---

## ✅ Troubleshooting

### Port Already in Use

If you get "EADDRINUSE" error:

**Windows:**
```bash
# Find and kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
lsof -ti:3000 | xargs kill -9
```

### Services Won't Start

1. **Check .env file exists**:
   ```bash
   cat .env
   ```

2. **Check MongoDB is running**:
   ```bash
   # Windows
   net start MongoDB
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Check Node.js is installed**:
   ```bash
   node --version
   npm --version
   ```

4. **Reinstall dependencies**:
   ```bash
   npm install
   cd frontend && npm install
   ```

### Frontend Not Loading

```bash
# Port 5173 might be taken, try:
cd frontend
npm run dev -- --port 3001
```

---

## 🔄 Restart Services

### Quick Restart (Windows)
```bash
stop-all.bat
timeout /t 2
start-all.bat
```

### Quick Restart (Linux/Mac)
```bash
./stop-all.sh
sleep 2
./start-all.sh
```

---

## 📊 Check Running Services

**Windows:**
```bash
# Check if services running
Get-NetTCPConnection -LocalPort 3000,5173,8545 -State Listen
```

**Linux/Mac:**
```bash
# Check if services running
lsof -i :3000
lsof -i :5173
lsof -i :8545
```

---

## 🎯 Typical Workflow

```bash
# Start project
start-all.bat              # or ./start-all.sh on Mac/Linux

# Work on features
# (Services auto-reload on code changes)

# When done, stop everything
stop-all.bat               # or ./stop-all.sh on Mac/Linux
```

---

## 🚨 Common Issues & Solutions

### Issue: "MongoDB connection failed"
```bash
# Solution: Start MongoDB
# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

### Issue: "Smart contract deployment failed"
```bash
# Solution: Check blockchain is running and contract is valid
npx hardhat compile --force
npx hardhat run scripts/deploy.js --network localhost
```

### Issue: "Cannot find module"
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
cd frontend && npm install && cd ..
```

### Issue: "CORS errors in frontend"
```bash
# Solution: Restart backend (handles client connections on frontend port)
stop-all.bat
start-all.bat
```

---

## 💡 Tips

- 📝 Check logs in `logs/` directory for detailed error messages
- 🔄 Frontend auto-reloads when code changes
- 🔄 Backend requires manual restart for changes
- 🔄 Smart contract requires redeploy for changes
- 📍 Always ensure `.env` file is properly configured
- 🔐 Keep `.env` in `.gitignore` (don't commit credentials)

---

## 📞 Quick Reference

| Task | Command |
|------|---------|
| Start all services | `start-all.bat` |
| Stop all services | `stop-all.bat` |
| View backend logs | `tail -f logs/backend.log` |
| View frontend logs | `tail -f logs/frontend.log` |
| Check running services | `Get-NetTCPConnection -LocalPort 3000,5173,8545...` |
| Kill service on port 3000 | `netstat -ano \| findstr :3000` then `taskkill /PID <id>` |
| Restart backend only | `npm start` |
| Restart frontend only | `cd frontend && npm run dev` |

---

For more details, see `QUICK_START.md`