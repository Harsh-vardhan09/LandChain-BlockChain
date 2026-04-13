import { ethers } from 'ethers';
import contractConfig from '../../../artifacts/contract-config.json';

let contract = null;
let signer = null;

export const initializeContract = async (walletSigner) => {
  if (!walletSigner) {
    throw new Error('Wallet signer is required');
  }

  signer = walletSigner;
  const contractAddress = contractConfig.address;

  if (contractAddress === '0x0000000000000000000000000000000000000000') {
    throw new Error('Contract not deployed. Please deploy the contract first.');
  }

  contract = new ethers.Contract(contractAddress, contractConfig.abi, signer);
  return contract;
};

export const getContract = () => {
  if (!contract) {
    throw new Error('Contract not initialized. Call initializeContract first.');
  }
  return contract;
};

// Contract interaction functions
export const registerLand = async (title, location, areaSqFt, documentHash) => {
  const contract = getContract();
  const tx = await contract.registerLand(title, location, areaSqFt, documentHash);
  return await tx.wait();
};

export const verifyLand = async (landId) => {
  const contract = getContract();
  const tx = await contract.verifyLand(landId);
  return await tx.wait();
};

export const listForSale = async (landId, priceInWei) => {
  const contract = getContract();
  const tx = await contract.listForSale(landId, priceInWei);
  return await tx.wait();
};

export const delistFromSale = async (landId) => {
  const contract = getContract();
  const tx = await contract.delistFromSale(landId);
  return await tx.wait();
};

export const buyLand = async (landId, priceInWei) => {
  const contract = getContract();
  const tx = await contract.buyLand(landId, { value: priceInWei });
  return await tx.wait();
};

export const requestTransfer = async (landId, to, reason) => {
  const contract = getContract();
  const tx = await contract.requestTransfer(landId, to, reason);
  return await tx.wait();
};

export const approveTransfer = async (requestId) => {
  const contract = getContract();
  const tx = await contract.approveTransfer(requestId);
  return await tx.wait();
};

export const rejectTransfer = async (requestId, reason) => {
  const contract = getContract();
  const tx = await contract.rejectTransfer(requestId, reason);
  return await tx.wait();
};

export const updateDocumentHash = async (landId, newHash) => {
  const contract = getContract();
  const tx = await contract.updateDocumentHash(landId, newHash);
  return await tx.wait();
};

// Read-only functions
export const getLandDetails = async (landId) => {
  const contract = getContract();
  return await contract.getLandDetails(landId);
};

export const getLandsByOwner = async (owner) => {
  const contract = getContract();
  return await contract.getLandsByOwner(owner);
};

export const getTransferHistory = async (landId) => {
  const contract = getContract();
  return await contract.getTransferHistory(landId);
};

export const getLandCount = async () => {
  const contract = getContract();
  return await contract.landCount();
};

export const hasRole = async (role, account) => {
  const contract = getContract();
  return await contract.hasRole(role, account);
};

export const getContractAddress = () => {
  return contractConfig.address;
};

export const getContractAbi = () => {
  return contractConfig.abi;
};