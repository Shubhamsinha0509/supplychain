const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory storage for batches (empty by default)
let batches = [];
let nextId = 1;

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
  
  const userBatches = batches.filter(batch => batch.userId === userId);
  
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

app.post('/api/batches', (req, res) => {
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
    
    const newBatch = {
      id: nextId++,
      batchId: `BCH${String(Math.floor(Math.random() * 1000) + 1).padStart(3, '0')}`,
      produceType: produceType.trim(),
      quantity: parseInt(quantity),
      status: 'REGISTERED',
      harvestDate: harvestDateObj.toISOString().split('T')[0],
      location: location.trim(),
      qualityGrade,
      farmer: farmer ? farmer.trim() : 'Unknown Farmer',
      notes: notes ? notes.trim() : '',
      userId: userId || null,
      userEmail: userEmail || null,
      createdAt: new Date().toISOString()
    };
    
    // Add the new batch to the array
    batches.push(newBatch);
    
    console.log('New batch created:', newBatch);
    console.log('Total batches:', batches.length);
    
    res.status(201).json({
      success: true,
      data: newBatch,
      message: 'Batch created successfully'
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API docs: http://localhost:${PORT}/api/batches`);
});
