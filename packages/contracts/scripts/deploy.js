const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Starting contract deployment...");

  // Get the contract factories
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const Pricing = await ethers.getContractFactory("Pricing");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

  // Deploy SupplyChain contract
  console.log("📦 Deploying SupplyChain contract...");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment();
  const supplyChainAddress = await supplyChain.getAddress();
  console.log("✅ SupplyChain deployed to:", supplyChainAddress);

  // Deploy Pricing contract
  console.log("📦 Deploying Pricing contract...");
  const pricing = await Pricing.deploy();
  await pricing.waitForDeployment();
  const pricingAddress = await pricing.getAddress();
  console.log("✅ Pricing deployed to:", pricingAddress);

  // Setup roles for testing
  console.log("🔐 Setting up roles for testing...");
  
  // Get test accounts
  const accounts = await ethers.getSigners();
  const farmer = accounts[1];
  const transporter = accounts[2];
  const wholesaler = accounts[3];
  const retailer = accounts[4];
  const government = accounts[5];

  // Grant roles in SupplyChain contract
  const FARMER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("FARMER_ROLE"));
  const TRANSPORTER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("TRANSPORTER_ROLE"));
  const WHOLESALER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("WHOLESALER_ROLE"));
  const RETAILER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("RETAILER_ROLE"));
  const GOVERNMENT_ROLE = ethers.keccak256(ethers.toUtf8Bytes("GOVERNMENT_ROLE"));

  await supplyChain.grantRole(FARMER_ROLE, farmer.address);
  await supplyChain.grantRole(TRANSPORTER_ROLE, transporter.address);
  await supplyChain.grantRole(WHOLESALER_ROLE, wholesaler.address);
  await supplyChain.grantRole(RETAILER_ROLE, retailer.address);
  await supplyChain.grantRole(GOVERNMENT_ROLE, government.address);

  // Grant roles in Pricing contract
  await pricing.grantRole(GOVERNMENT_ROLE, government.address);
  await pricing.grantRole(WHOLESALER_ROLE, wholesaler.address);
  await pricing.grantRole(RETAILER_ROLE, retailer.address);

  console.log("✅ Roles granted successfully");

  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId,
    deployer: deployer.address,
    contracts: {
      SupplyChain: supplyChainAddress,
      Pricing: pricingAddress
    },
    accounts: {
      farmer: farmer.address,
      transporter: transporter.address,
      wholesaler: wholesaler.address,
      retailer: retailer.address,
      government: government.address
    },
    timestamp: new Date().toISOString()
  };

  // Write deployment info to file
  const fs = require('fs');
  const path = require('path');
  const deploymentPath = path.join(__dirname, '../deployments.json');
  
  // Convert BigInt to string for JSON serialization
  const serializableInfo = {
    ...deploymentInfo,
    chainId: deploymentInfo.chainId.toString()
  };
  
  fs.writeFileSync(deploymentPath, JSON.stringify(serializableInfo, null, 2));

  console.log("💾 Deployment info saved to deployments.json");

  // Display summary
  console.log("\n🎉 Deployment Summary:");
  console.log("=====================");
  console.log(`Network: ${deploymentInfo.network} (Chain ID: ${deploymentInfo.chainId})`);
  console.log(`Deployer: ${deploymentInfo.deployer}`);
  console.log(`SupplyChain: ${supplyChainAddress}`);
  console.log(`Pricing: ${pricingAddress}`);
  console.log("\nTest Accounts:");
  console.log(`Farmer: ${farmer.address}`);
  console.log(`Transporter: ${transporter.address}`);
  console.log(`Wholesaler: ${wholesaler.address}`);
  console.log(`Retailer: ${retailer.address}`);
  console.log(`Government: ${government.address}`);

  // Environment variables for API Gateway
  console.log("\n🔧 Add these to your .env file:");
  console.log(`SUPPLY_CHAIN_CONTRACT_ADDRESS=${supplyChainAddress}`);
  console.log(`PRICING_CONTRACT_ADDRESS=${pricingAddress}`);
  console.log(`BLOCKCHAIN_RPC_URL=http://localhost:8545`);

  return deploymentInfo;
}

// Execute deployment
main()
  .then(() => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });
