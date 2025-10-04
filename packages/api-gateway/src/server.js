const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const BlockchainService = require('./services/blockchain/blockchainService');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for batches (empty by default)
let batches = [];
let nextId = 1;

// Initialize blockchain service
const blockchainService = new BlockchainService();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JSON parsing error handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON parsing error:', err.message);
    return res.status(400).json({
      success: false,
      message: 'Invalid JSON format',
      error: 'Malformed JSON in request body'
    });
  }
  next(err);
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.body) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Blockchain Supply Chain API',
    version: '1.0.0',
    status: 'running'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
// Get batches filtered by user
app.get('/api/batches/user/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Convert userId to number for comparison since it's stored as a number
  const userBatches = batches.filter(batch => batch.userId === parseInt(userId));
  
  res.json({
    success: true,
    data: userBatches,
    count: userBatches.length
  });
});

// Get all batches (for admin purposes)
app.get('/api/batches', (req, res) => {
  res.json({
    success: true,
    data: batches,
    count: batches.length
  });
});

// Clear all batches (for testing purposes)
app.delete('/api/batches', (req, res) => {
  batches = [];
  nextId = 1;
  res.json({
    success: true,
    message: 'All batches cleared',
    count: 0
  });
});

app.get('/api/batches/:id', (req, res) => {
  const batchId = parseInt(req.params.id);
  const batch = batches.find(b => b.id === batchId);
  
  if (!batch) {
    return res.status(404).json({
      success: false,
      message: 'Batch not found'
    });
  }
  
  res.json({
    success: true,
    data: batch
  });
});

app.post('/api/batches', async (req, res) => {
  try {
    const { produceType, quantity, harvestDate, location, qualityGrade, farmer, notes, userId, userEmail } = req.body;
    
    // Input validation
    if (!produceType || !quantity || !harvestDate || !location || !qualityGrade) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        error: 'produceType, quantity, harvestDate, location, and qualityGrade are required'
      });
    }

    // Validate quantity is a positive number
    if (isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity',
        error: 'Quantity must be a positive number'
      });
    }

    // Validate quality grade
    if (!['A', 'B', 'C'].includes(qualityGrade)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quality grade',
        error: 'Quality grade must be A, B, or C'
      });
    }

    // Validate harvest date format
    const harvestDateObj = new Date(harvestDate);
    if (isNaN(harvestDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid harvest date',
        error: 'Harvest date must be a valid date'
      });
    }
    
    // Create batch data for blockchain
    const batchData = {
      produceType: produceType.trim(),
      quantity: parseInt(quantity),
      harvestDate: harvestDateObj.toISOString().split('T')[0],
      location: location.trim(),
      qualityGrade,
      ipfsHash: `QmBatch${Date.now()}` // Generate unique IPFS hash
    };

    let blockchainResult = null;
    
    // Try to register on blockchain if service is ready
    if (blockchainService.isReady()) {
      try {
        blockchainResult = await blockchainService.registerBatch(batchData);
        console.log('✅ Batch registered on blockchain:', blockchainResult);
      } catch (blockchainError) {
        console.warn('⚠️  Blockchain registration failed, continuing with local storage:', blockchainError.message);
      }
    } else {
      console.log('⚠️  Blockchain service not ready, using local storage only');
    }
    
    const newBatch = {
      id: nextId++,
      batchId: blockchainResult?.batchId || `BCH${String(Math.floor(Math.random() * 1000) + 1).padStart(3, '0')}`,
      produceType: produceType.trim(),
      quantity: parseInt(quantity),
      status: 'REGISTERED',
      harvestDate: harvestDateObj.toISOString().split('T')[0],
      location: location.trim(),
      qualityGrade,
      farmer: farmer ? farmer.trim() : 'Unknown Farmer',
      notes: notes ? notes.trim() : '',
      userId: userId ? parseInt(userId) : null,
      userEmail: userEmail || null,
      createdAt: new Date().toISOString(),
      blockchain: blockchainResult ? {
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        onBlockchain: true
      } : {
        onBlockchain: false
      }
    };
    
    // Generate QR code for the new batch
    let qrCodeResult = null;
    try {
      const qrServiceUrl = process.env.QR_SERVICE_URL || 'http://localhost:3002';
      const qrResponse = await axios.post(`${qrServiceUrl}/api/qr/generate/batch`, {
        batchData: {
          batchId: newBatch.batchId,
          produceType: newBatch.produceType,
          farmer: newBatch.farmer,
          harvestDate: newBatch.harvestDate,
          qualityGrade: newBatch.qualityGrade,
          quantity: newBatch.quantity,
          status: newBatch.status,
          location: newBatch.location,
          ipfsHash: `QmBatch${Date.now()}`,
          timestamp: newBatch.createdAt,
          blockchain: newBatch.blockchain
        },
        options: {
          width: 300,
          includeMetadata: true
        }
      });
      
      if (qrResponse.data.success) {
        qrCodeResult = qrResponse.data.data;
        newBatch.qrCode = {
          qrId: qrCodeResult.qrId,
          qrCodeDataURL: qrCodeResult.qrCodeDataURL,
          scanUrl: qrCodeResult.scanUrl,
          generatedAt: qrCodeResult.metadata.generatedAt
        };
        console.log('✅ QR code generated for new batch:', newBatch.batchId);
      }
    } catch (qrError) {
      console.warn('⚠️  QR code generation failed for new batch:', qrError.message);
    }

    // Add the new batch to the array
    batches.push(newBatch);
    
    console.log('New batch created:', newBatch);
    console.log('Total batches:', batches.length);
    
    res.status(201).json({
      success: true,
      data: newBatch,
      message: 'Batch created successfully',
      blockchain: blockchainResult ? 'Registered on blockchain' : 'Stored locally only',
      qrCode: qrCodeResult ? 'QR code generated' : 'QR generation failed'
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create batch',
      error: error.message
    });
  }
});

// Update batch status with QR code generation
app.put('/api/batches/:id/status', async (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    const { status, description, location, ipfsHash } = req.body;
    
    // Find the batch
    const batchIndex = batches.findIndex(b => b.id === batchId);
    if (batchIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    const batch = batches[batchIndex];
    
    // Update batch status
    batch.status = status;
    batch.updatedAt = new Date().toISOString();
    if (description) batch.notes = description;
    if (location) batch.location = location;

    // Try to update on blockchain if service is ready
    let blockchainResult = null;
    if (blockchainService.isReady()) {
      try {
        blockchainResult = await blockchainService.updateBatchStatus(
          batch.batchId,
          status,
          description || '',
          location || batch.location,
          ipfsHash || ''
        );
        console.log('✅ Batch status updated on blockchain:', blockchainResult);
      } catch (blockchainError) {
        console.warn('⚠️  Blockchain update failed:', blockchainError.message);
      }
    }

    // Generate QR code for the updated batch
    let qrCodeResult = null;
    try {
      const qrServiceUrl = process.env.QR_SERVICE_URL || 'http://localhost:3002';
      const qrResponse = await axios.post(`${qrServiceUrl}/api/qr/generate/batch`, {
        batchData: {
          batchId: batch.batchId,
          produceType: batch.produceType,
          farmer: batch.farmer,
          harvestDate: batch.harvestDate,
          qualityGrade: batch.qualityGrade,
          status: batch.status,
          location: batch.location,
          ipfsHash: ipfsHash || `QmBatch${Date.now()}`
        },
        options: {
          width: 300,
          includeMetadata: true
        }
      });
      
      if (qrResponse.data.success) {
        qrCodeResult = qrResponse.data.data;
        batch.qrCode = {
          qrId: qrCodeResult.qrId,
          qrCodeDataURL: qrCodeResult.qrCodeDataURL,
          scanUrl: qrCodeResult.scanUrl,
          generatedAt: qrCodeResult.metadata.generatedAt
        };
        console.log('✅ QR code generated for batch:', batch.batchId);
      }
    } catch (qrError) {
      console.warn('⚠️  QR code generation failed:', qrError.message);
    }

    // Update the batch in storage
    batches[batchIndex] = batch;

    res.json({
      success: true,
      data: batch,
      message: 'Batch status updated successfully',
      blockchain: blockchainResult ? 'Updated on blockchain' : 'Local update only',
      qrCode: qrCodeResult ? 'QR code generated' : 'QR generation failed'
    });

  } catch (error) {
    console.error('Error updating batch status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update batch status',
      error: error.message
    });
  }
});

// Generate QR code for existing batch
app.post('/api/batches/:id/qr', async (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    const batch = batches.find(b => b.id === batchId);
    
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    // Generate QR code
    const qrServiceUrl = process.env.QR_SERVICE_URL || 'http://localhost:3002';
    const qrResponse = await axios.post(`${qrServiceUrl}/api/qr/generate/batch`, {
      batchData: {
        batchId: batch.batchId,
        produceType: batch.produceType,
        farmer: batch.farmer,
        harvestDate: batch.harvestDate,
        qualityGrade: batch.qualityGrade,
        quantity: batch.quantity,
        status: batch.status,
        location: batch.location,
        ipfsHash: `QmBatch${Date.now()}`,
        timestamp: batch.createdAt,
        blockchain: batch.blockchain
      },
      options: {
        width: 300,
        includeMetadata: true
      }
    });

    if (qrResponse.data.success) {
      const qrCodeResult = qrResponse.data.data;
      batch.qrCode = {
        qrId: qrCodeResult.qrId,
        qrCodeDataURL: qrCodeResult.qrCodeDataURL,
        scanUrl: qrCodeResult.scanUrl,
        generatedAt: qrCodeResult.metadata.generatedAt
      };

      res.json({
        success: true,
        data: {
          batch: batch,
          qrCode: qrCodeResult
        },
        message: 'QR code generated successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to generate QR code'
      });
    }

  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
});

// Blockchain-specific endpoints
app.get('/api/blockchain/status', (req, res) => {
  res.json({
    success: true,
    data: {
      connected: blockchainService.isReady(),
      contracts: blockchainService.getContractAddresses(),
      network: process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545'
    }
  });
});

app.get('/api/blockchain/batch/:id', async (req, res) => {
  try {
    const batchId = req.params.id;
    
    if (!blockchainService.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain service not available'
      });
    }

    const result = await blockchainService.getBatch(batchId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching batch from blockchain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch from blockchain',
      error: error.message
    });
  }
});

app.get('/api/blockchain/batch/:id/events', async (req, res) => {
  try {
    const batchId = req.params.id;
    
    if (!blockchainService.isReady()) {
      return res.status(503).json({
        success: false,
        message: 'Blockchain service not available'
      });
    }

    const result = await blockchainService.getBatchEvents(batchId);
    res.json(result);
  } catch (error) {
    console.error('Error fetching batch events from blockchain:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch batch events from blockchain',
      error: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Initialize blockchain service and start server
async function startServer() {
  try {
    // Initialize blockchain service
    console.log('🔗 Initializing blockchain service...');
    const blockchainReady = await blockchainService.initialize();
    
    if (blockchainReady) {
      console.log('✅ Blockchain service initialized successfully');
      const addresses = blockchainService.getContractAddresses();
      if (addresses) {
        console.log(`   SupplyChain: ${addresses.supplyChain}`);
        console.log(`   Pricing: ${addresses.pricing}`);
      }
    } else {
      console.log('⚠️  Blockchain service initialization failed, running in local-only mode');
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 API Gateway running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`📋 API docs: http://localhost:${PORT}/api/batches`);
      console.log(`🔗 Blockchain: ${blockchainReady ? 'Connected' : 'Local-only mode'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server
startServer();
