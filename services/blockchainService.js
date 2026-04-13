const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const Land = require('../models/Land');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');

// Load contract config
const contractConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '../artifacts/contract-config.json'), 'utf8'));
const CONTRACT_ADDRESS = contractConfig.address;
const CONTRACT_ABI = contractConfig.abi;

// Initialize provider and contract
let provider;
let contract;

function initializeBlockchainService() {
  // For development, use local hardhat network
  provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
  contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

async function getSigner(privateKey) {
  const wallet = new ethers.Wallet(privateKey, provider);
  return contract.connect(wallet);
}

// Contract interaction functions
async function registerLandOnChain(title, location, areaSqFt, docHash, signerPrivateKey) {
  const signer = await getSigner(signerPrivateKey);
  const tx = await signer.registerLand(title, location, areaSqFt, docHash);
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}

async function verifyLandOnChain(landId, signerPrivateKey) {
  const signer = await getSigner(signerPrivateKey);
  const tx = await signer.verifyLand(landId);
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}

async function requestTransferOnChain(landId, toAddress, reason, signerPrivateKey) {
  const signer = await getSigner(signerPrivateKey);
  const tx = await signer.requestTransfer(landId, toAddress, reason);
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}

async function approveTransferOnChain(requestId, adminPrivateKey) {
  const signer = await getSigner(adminPrivateKey);
  const tx = await signer.approveTransfer(requestId);
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}

async function rejectTransferOnChain(requestId, reason, adminPrivateKey) {
  const signer = await getSigner(adminPrivateKey);
  const tx = await signer.rejectTransfer(requestId, reason);
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}

async function buyLandOnChain(landId, priceInWei, buyerPrivateKey) {
  const signer = await getSigner(buyerPrivateKey);
  const tx = await signer.buyLand(landId, { value: priceInWei });
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}

async function listForSaleOnChain(landId, priceInWei, signerPrivateKey) {
  const signer = await getSigner(signerPrivateKey);
  const tx = await signer.listForSale(landId, priceInWei);
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}

async function delistFromSaleOnChain(landId, signerPrivateKey) {
  const signer = await getSigner(signerPrivateKey);
  const tx = await signer.delistFromSale(landId);
  const receipt = await tx.wait();
  return { txHash: tx.hash, receipt };
}

async function getLandFromChain(landId) {
  const landDetails = await contract.getLandDetails(landId);
  return {
    landId: Number(landDetails[0]),
    title: landDetails[1],
    location: landDetails[2],
    areaSqFt: Number(landDetails[3]),
    owner: landDetails[4],
    registeredBy: landDetails[5],
    isVerified: landDetails[6],
    isForSale: landDetails[7],
    salePrice: landDetails[8].toString(),
    registeredAt: new Date(Number(landDetails[9]) * 1000),
    documentHash: landDetails[10]
  };
}

async function syncLandToMongo(landId) {
  const chainData = await getLandFromChain(landId);
  const mongoLand = await Land.findOneAndUpdate(
    { landId },
    {
      ...chainData,
      lastUpdated: new Date()
    },
    { upsert: true, new: true }
  );
  return mongoLand;
}

async function listenToEvents() {
  console.log('Starting blockchain event listeners...');

  // Land Registered
  contract.on('LandRegistered', async (landId, owner, title, event) => {
    console.log('LandRegistered event:', landId, owner, title);
    await syncLandToMongo(Number(landId));

    // Create transaction record
    await Transaction.create({
      txHash: event.log.transactionHash,
      type: 'register',
      landId: Number(landId),
      from: null,
      to: owner,
      blockNumber: event.log.blockNumber,
      status: 'confirmed',
      timestamp: new Date(),
      gasUsed: event.log.gasUsed?.toString(),
      metadata: { title }
    });
  });

  // Land Verified
  contract.on('LandVerified', async (landId, inspector, event) => {
    console.log('LandVerified event:', landId, inspector);
    await syncLandToMongo(Number(landId));

    await Transaction.create({
      txHash: event.log.transactionHash,
      type: 'verify',
      landId: Number(landId),
      from: null,
      to: inspector,
      blockNumber: event.log.blockNumber,
      status: 'confirmed',
      timestamp: new Date(),
      gasUsed: event.log.gasUsed?.toString()
    });

    // Notify owner
    const land = await Land.findOne({ landId: Number(landId) });
    if (land) {
      await Notification.create({
        walletAddress: land.owner,
        type: 'land_verified',
        message: `Your land ${land.title} has been verified`,
        landId: Number(landId),
        isRead: false
      });
    }
  });

  // Land Listed for Sale
  contract.on('LandListedForSale', async (landId, price, event) => {
    console.log('LandListedForSale event:', landId, price);
    await syncLandToMongo(Number(landId));

    await Transaction.create({
      txHash: event.log.transactionHash,
      type: 'list',
      landId: Number(landId),
      amount: price.toString(),
      blockNumber: event.log.blockNumber,
      status: 'confirmed',
      timestamp: new Date(),
      gasUsed: event.log.gasUsed?.toString()
    });
  });

  // Land Delisted
  contract.on('LandDelisted', async (landId, event) => {
    console.log('LandDelisted event:', landId);
    await syncLandToMongo(Number(landId));

    await Transaction.create({
      txHash: event.log.transactionHash,
      type: 'delist',
      landId: Number(landId),
      blockNumber: event.log.blockNumber,
      status: 'confirmed',
      timestamp: new Date(),
      gasUsed: event.log.gasUsed?.toString()
    });
  });

  // Land Sold
  contract.on('LandSold', async (landId, from, to, price, event) => {
    console.log('LandSold event:', landId, from, to, price);
    await syncLandToMongo(Number(landId));

    await Transaction.create({
      txHash: event.log.transactionHash,
      type: 'sale',
      landId: Number(landId),
      from,
      to,
      amount: price.toString(),
      blockNumber: event.log.blockNumber,
      status: 'confirmed',
      timestamp: new Date(),
      gasUsed: event.log.gasUsed?.toString()
    });

    // Notify seller
    await Notification.create({
      walletAddress: from,
      type: 'sale',
      message: `Your land has been sold for ${ethers.formatEther(price)} ETH`,
      landId: Number(landId),
      isRead: false
    });
  });

  // Transfer Requested
  contract.on('TransferRequested', async (requestId, landId, from, to, event) => {
    console.log('TransferRequested event:', requestId, landId, from, to);

    await Transaction.create({
      txHash: event.log.transactionHash,
      type: 'transfer',
      landId: Number(landId),
      from,
      to,
      blockNumber: event.log.blockNumber,
      status: 'pending',
      timestamp: new Date(),
      gasUsed: event.log.gasUsed?.toString(),
      metadata: { requestId: Number(requestId) }
    });

    // Notify recipient
    await Notification.create({
      walletAddress: to,
      type: 'transfer_request',
      message: `You have received a transfer request for land ${landId}`,
      landId: Number(landId),
      isRead: false
    });
  });

  // Transfer Approved
  contract.on('TransferApproved', async (requestId, landId, from, to, event) => {
    console.log('TransferApproved event:', requestId, landId, from, to);
    await syncLandToMongo(Number(landId));

    await Transaction.findOneAndUpdate(
      { 'metadata.requestId': Number(requestId) },
      { status: 'confirmed' }
    );

    // Notify both parties
    await Notification.create({
      walletAddress: from,
      type: 'transfer_approved',
      message: `Your transfer request for land ${landId} has been approved`,
      landId: Number(landId),
      isRead: false
    });

    await Notification.create({
      walletAddress: to,
      type: 'transfer_approved',
      message: `Land ${landId} has been transferred to you`,
      landId: Number(landId),
      isRead: false
    });
  });

  // Transfer Rejected
  contract.on('TransferRejected', async (requestId, landId, reason, event) => {
    console.log('TransferRejected event:', requestId, landId, reason);

    await Transaction.findOneAndUpdate(
      { 'metadata.requestId': Number(requestId) },
      { status: 'failed', metadata: { reason } }
    );

    // Get transfer details
    const transferHistory = await contract.getTransferHistory(landId);
    const transfer = transferHistory.find(t => Number(t[0]) === Number(requestId));

    if (transfer) {
      await Notification.create({
        walletAddress: transfer[2], // from
        type: 'transfer_rejected',
        message: `Your transfer request for land ${landId} has been rejected: ${reason}`,
        landId: Number(landId),
        isRead: false
      });
    }
  });

  // Handle websocket reconnection
  provider.on('error', (error) => {
    console.error('Provider error:', error);
    setTimeout(() => {
      console.log('Attempting to reconnect...');
      initializeBlockchainService();
      listenToEvents();
    }, 5000);
  });
}

module.exports = {
  initializeBlockchainService,
  registerLandOnChain,
  verifyLandOnChain,
  requestTransferOnChain,
  approveTransferOnChain,
  rejectTransferOnChain,
  buyLandOnChain,
  listForSaleOnChain,
  delistFromSaleOnChain,
  getLandFromChain,
  syncLandToMongo,
  listenToEvents
};