const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying LandRegistry contract...");

  const [deployer, inspector] = await ethers.getSigners();
  const LandRegistry = await ethers.getContractFactory("LandRegistry");
  const landRegistry = await LandRegistry.deploy();
  await landRegistry.waitForDeployment();

  const registrarRole = await landRegistry.REGISTRAR_ROLE();
  const inspectorRole = await landRegistry.INSPECTOR_ROLE();

  await landRegistry.grantRole(registrarRole, deployer.address);
  await landRegistry.grantRole(inspectorRole, inspector.address);

  console.log("Deployer:", deployer.address);
  console.log("Registrar:", deployer.address);
  console.log("Inspector:", inspector.address);
  console.log("REGISTRAR_ROLE:", registrarRole);
  console.log("INSPECTOR_ROLE:", inspectorRole);

  const sampleLands = [
    {
      title: "Survey No. 42, Sector 5",
      location: "28.7041,77.1025",
      areaSqFt: 1200,
      documentHash: "QmRNm1oV3wzQn4sZg6wx8U3Y5cVt8E5cK7o6x9H3R9A1"
    },
    {
      title: "Plot No. 18, MG Road",
      location: "19.0760,72.8777",
      areaSqFt: 1500,
      documentHash: "QmY7aWkev7N3UfH6j2qB8fD5P4rXeG7zL1N2eS4Xa6t"
    },
    {
      title: "Block C, Whitefield",
      location: "12.9716,77.5946",
      areaSqFt: 1800,
      documentHash: "QmZ9oLxV1u8yE5fS2wQ6dP7gH3jK9nT4uV2bW8pR0s"
    },
    {
      title: "Ward 12, Ring Road",
      location: "13.0827,80.2707",
      areaSqFt: 2000,
      documentHash: "QmK4vN1tS5xW3bD8gE9rP6hA2uZ7yF4cV1qM0nR5j"
    },
    {
      title: "Garden Plot, Sector 63",
      location: "28.4595,77.0266",
      areaSqFt: 1400,
      documentHash: "QmD6mP2qF8vJ9rS1uT5yN4zW3cE7kL0oB6hA1gV8x"
    }
  ];

  for (const land of sampleLands) {
    const tx = await landRegistry.registerLand(
      land.title,
      land.location,
      land.areaSqFt,
      land.documentHash
    );
    await tx.wait();
  }

  const contractConfig = {
    address: landRegistry.target,
    abi: landRegistry.interface.formatJson()
  };

  const outputPath = path.join(__dirname, "..", "artifacts", "contract-config.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(contractConfig, null, 2), "utf8");

  console.log("Deployed contract address:", landRegistry.target);
  console.log(`Saved contract config to ${outputPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
