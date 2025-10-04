const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

/**
 * Blockchain Service for interacting with smart contracts
 */
class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.supplyChainContract = null;
    this.pricingContract = null;
    this.isInitialized = false;
  }

  /**
   * Initialize blockchain connection
   */
  async initialize() {
    try {
      // Connect to local Hardhat network
      this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545');
      
      // Get network info
      const network = await this.provider.getNetwork();
      console.log(`🔗 Connected to blockchain network: ${network.name} (Chain ID: ${network.chainId})`);

      // Load contract ABIs
      const supplyChainABI = this.loadContractABI('SupplyChain');
      const pricingABI = this.loadContractABI('Pricing');

      // Get contract addresses from environment or use deployed addresses
      const supplyChainAddress = process.env.SUPPLY_CHAIN_CONTRACT_ADDRESS;
      const pricingAddress = process.env.PRICING_CONTRACT_ADDRESS;

      if (!supplyChainAddress || !pricingAddress) {
        console.log('⚠️  Contract addresses not found. Deploying contracts...');
        await this.deployContracts();
      } else {
        // Connect to existing contracts
        this.supplyChainContract = new ethers.Contract(supplyChainAddress, supplyChainABI, this.provider);
        this.pricingContract = new ethers.Contract(pricingAddress, pricingABI, this.provider);
        console.log(`✅ Connected to deployed contracts`);
        console.log(`   SupplyChain: ${supplyChainAddress}`);
        console.log(`   Pricing: ${pricingAddress}`);
      }

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize blockchain service:', error.message);
      return false;
    }
  }

  /**
   * Deploy contracts to local network
   */
  async deployContracts() {
    try {
      console.log('🚀 Deploying contracts to local network...');
      
      // Get deployer account (first account from Hardhat)
      const accounts = await this.provider.listAccounts();
      if (accounts.length === 0) {
        throw new Error('No accounts available for deployment');
      }
      
      this.signer = accounts[0];
      console.log(`📝 Using deployer account: ${this.signer.address}`);

      // Deploy SupplyChain contract
      const SupplyChainFactory = new ethers.ContractFactory(
        this.loadContractABI('SupplyChain'),
        this.loadContractBytecode('SupplyChain'),
        this.signer
      );
      
      this.supplyChainContract = await SupplyChainFactory.deploy();
      await this.supplyChainContract.waitForDeployment();
      const supplyChainAddress = await this.supplyChainContract.getAddress();
      
      console.log(`✅ SupplyChain deployed to: ${supplyChainAddress}`);

      // Deploy Pricing contract
      const PricingFactory = new ethers.ContractFactory(
        this.loadContractABI('Pricing'),
        this.loadContractBytecode('Pricing'),
        this.signer
      );
      
      this.pricingContract = await PricingFactory.deploy();
      await this.pricingContract.waitForDeployment();
      const pricingAddress = await this.pricingContract.getAddress();
      
      console.log(`✅ Pricing deployed to: ${pricingAddress}`);

      // Save contract addresses to environment
      this.saveContractAddresses(supplyChainAddress, pricingAddress);

      return { supplyChainAddress, pricingAddress };
    } catch (error) {
      console.error('❌ Failed to deploy contracts:', error.message);
      throw error;
    }
  }

  /**
   * Load contract ABI from artifacts
   */
  loadContractABI(contractName) {
    try {
      const artifactPath = path.join(__dirname, '../../../../contracts/artifacts/contracts', `${contractName}.sol`, `${contractName}.json`);
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      return artifact.abi;
    } catch (error) {
      console.error(`❌ Failed to load ABI for ${contractName}:`, error.message);
      return [];
    }
  }

  /**
   * Load contract bytecode from artifacts
   */
  loadContractBytecode(contractName) {
    try {
      const artifactPath = path.join(__dirname, '../../../../contracts/artifacts/contracts', `${contractName}.sol`, `${contractName}.json`);
      const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
      return artifact.bytecode;
    } catch (error) {
      console.error(`❌ Failed to load bytecode for ${contractName}:`, error.message);
      return '0x';
    }
  }

  /**
   * Save contract addresses to .env file
   */
  saveContractAddresses(supplyChainAddress, pricingAddress) {
    try {
      const envPath = path.join(__dirname, '../../../../.env');
      let envContent = '';
      
      if (fs.existsSync(envPath)) {
        envContent = fs.readFileSync(envPath, 'utf8');
      }

      // Update or add contract addresses
      envContent = envContent.replace(/SUPPLY_CHAIN_CONTRACT_ADDRESS=.*/g, '');
      envContent = envContent.replace(/PRICING_CONTRACT_ADDRESS=.*/g, '');
      
      envContent += `\nSUPPLY_CHAIN_CONTRACT_ADDRESS=${supplyChainAddress}`;
      envContent += `\nPRICING_CONTRACT_ADDRESS=${pricingAddress}`;
      
      fs.writeFileSync(envPath, envContent);
      console.log('💾 Contract addresses saved to .env file');
    } catch (error) {
      console.error('❌ Failed to save contract addresses:', error.message);
    }
  }

  /**
   * Register a new batch on blockchain
   */
  async registerBatch(batchData) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const {
        produceType,
        quantity,
        harvestDate,
        location,
        qualityGrade,
        ipfsHash = 'QmDefaultHash123'
      } = batchData;

      // Convert harvest date to timestamp
      const harvestTimestamp = Math.floor(new Date(harvestDate).getTime() / 1000);

      // Call smart contract
      const tx = await this.supplyChainContract.registerBatch(
        produceType,
        quantity,
        harvestTimestamp,
        location,
        qualityGrade,
        ipfsHash
      );

      const receipt = await tx.wait();
      console.log(`✅ Batch registered on blockchain. TX: ${tx.hash}`);

      // Get the batch ID from the event
      const event = receipt.logs.find(log => {
        try {
          const parsed = this.supplyChainContract.interface.parseLog(log);
          return parsed.name === 'BatchCreated';
        } catch (e) {
          return false;
        }
      });

      let batchId = null;
      if (event) {
        const parsed = this.supplyChainContract.interface.parseLog(event);
        batchId = parsed.args.batchId.toString();
      }

      return {
        success: true,
        transactionHash: tx.hash,
        batchId: batchId,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('❌ Failed to register batch on blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Update batch status on blockchain
   */
  async updateBatchStatus(batchId, newStatus, description, location, ipfsHash = '') {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const tx = await this.supplyChainContract.updateBatchStatus(
        batchId,
        newStatus,
        description,
        location,
        ipfsHash
      );

      const receipt = await tx.wait();
      console.log(`✅ Batch status updated on blockchain. TX: ${tx.hash}`);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('❌ Failed to update batch status on blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Set batch price on blockchain
   */
  async setBatchPrice(batchId, price) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const tx = await this.supplyChainContract.setBatchPrice(batchId, price);
      const receipt = await tx.wait();
      console.log(`✅ Batch price set on blockchain. TX: ${tx.hash}`);

      return {
        success: true,
        transactionHash: tx.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('❌ Failed to set batch price on blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Get batch information from blockchain
   */
  async getBatch(batchId) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const batch = await this.supplyChainContract.getBatch(batchId);
      return {
        success: true,
        data: {
          batchId: batch.batchId.toString(),
          farmer: batch.farmer,
          produceType: batch.produceType,
          quantity: batch.quantity.toString(),
          harvestDate: new Date(parseInt(batch.harvestDate) * 1000).toISOString(),
          location: batch.location,
          qualityGrade: batch.qualityGrade,
          status: batch.status,
          createdAt: new Date(parseInt(batch.createdAt) * 1000).toISOString(),
          updatedAt: new Date(parseInt(batch.updatedAt) * 1000).toISOString(),
          ipfsHash: batch.ipfsHash,
          isActive: batch.isActive
        }
      };
    } catch (error) {
      console.error('❌ Failed to get batch from blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Get batch events from blockchain
   */
  async getBatchEvents(batchId) {
    if (!this.isInitialized) {
      throw new Error('Blockchain service not initialized');
    }

    try {
      const events = await this.supplyChainContract.getBatchEvents(batchId);
      return {
        success: true,
        data: events.map(event => ({
          eventId: event.eventId.toString(),
          batchId: event.batchId.toString(),
          actor: event.actor,
          eventType: event.eventType,
          description: event.description,
          timestamp: new Date(parseInt(event.timestamp) * 1000).toISOString(),
          location: event.location,
          ipfsHash: event.ipfsHash
        }))
      };
    } catch (error) {
      console.error('❌ Failed to get batch events from blockchain:', error.message);
      throw error;
    }
  }

  /**
   * Check if blockchain service is ready
   */
  isReady() {
    return this.isInitialized && this.supplyChainContract && this.pricingContract;
  }

  /**
   * Get contract addresses
   */
  getContractAddresses() {
    if (!this.isInitialized) {
      return null;
    }

    return {
      supplyChain: this.supplyChainContract?.target,
      pricing: this.pricingContract?.target
    };
  }
}

module.exports = BlockchainService;
