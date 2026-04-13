const { ethers } = require("ethers");
const contractArtifact = require("../artifacts/contracts/LandRegistry.sol/LandRegistry.json");

const providerUrl = process.env.PROVIDER_URL || "http://127.0.0.1:8545";
const contractAddress = process.env.CONTRACT_ADDRESS;
const privateKey = process.env.PRIVATE_KEY;

if (!contractAddress) {
  throw new Error("CONTRACT_ADDRESS environment variable is required");
}

if (!privateKey) {
  throw new Error("PRIVATE_KEY environment variable is required for transaction signing");
}

const provider = new ethers.JsonRpcProvider(providerUrl);
const wallet = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(contractAddress, contractArtifact.abi, wallet);

async function registerLand(id, location, area, owner) {
  const tx = await contract.registerLand(id, location, area, owner);
  return tx.wait();
}

async function verifyLand(id) {
  const tx = await contract.verifyLand(id);
  return tx.wait();
}

async function transferOwnership(id, newOwner) {
  const tx = await contract.transferOwnership(id, newOwner);
  return tx.wait();
}

async function getLand(id) {
  const land = await contract.getLand(id);
  return {
    id: land[0].toString(),
    location: land[1],
    area: land[2].toString(),
    owner: land[3],
    isVerified: land[4],
  };
}

module.exports = {
  registerLand,
  verifyLand,
  transferOwnership,
  getLand,
};