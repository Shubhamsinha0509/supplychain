const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const QRGenerator = require('./qrGenerator');
const QRScanner = require('./qrScanner');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize services
const qrGenerator = new QRGenerator();
const qrScanner = new QRScanner();

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'QR Service for Blockchain Supply Chain',
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

// Generate QR code for batch
app.post('/api/qr/generate/batch', async (req, res) => {
  try {
    const { batchData, options } = req.body;
    
    if (!batchData) {
      return res.status(400).json({
        success: false,
        message: 'Batch data is required'
      });
    }

    const result = await qrGenerator.generateBatchQR(batchData, options);
    res.json(result);
  } catch (error) {
    console.error('Error generating batch QR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate batch QR code',
      error: error.message
    });
  }
});

// Generate QR code for event
app.post('/api/qr/generate/event', async (req, res) => {
  try {
    const { eventData, options } = req.body;
    
    if (!eventData) {
      return res.status(400).json({
        success: false,
        message: 'Event data is required'
      });
    }

    const result = await qrGenerator.generateEventQR(eventData, options);
    res.json(result);
  } catch (error) {
    console.error('Error generating event QR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate event QR code',
      error: error.message
    });
  }
});

// Generate QR code for certificate
app.post('/api/qr/generate/certificate', async (req, res) => {
  try {
    const { certificateData, options } = req.body;
    
    if (!certificateData) {
      return res.status(400).json({
        success: false,
        message: 'Certificate data is required'
      });
    }

    const result = await qrGenerator.generateCertificateQR(certificateData, options);
    res.json(result);
  } catch (error) {
    console.error('Error generating certificate QR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate certificate QR code',
      error: error.message
    });
  }
});

// Scan QR code
app.post('/api/qr/scan', async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required'
      });
    }

    const result = await qrScanner.scanQR(qrData);
    res.json(result);
  } catch (error) {
    console.error('Error scanning QR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to scan QR code',
      error: error.message
    });
  }
});

// Parse QR payload
app.post('/api/qr/parse', async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: 'QR data is required'
      });
    }

    const result = qrGenerator.parseQRPayload(qrData);
    res.json(result);
  } catch (error) {
    console.error('Error parsing QR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to parse QR code',
      error: error.message
    });
  }
});

// Generate styled QR code
app.post('/api/qr/generate/styled', async (req, res) => {
  try {
    const { data, styleOptions } = req.body;
    
    if (!data) {
      return res.status(400).json({
        success: false,
        message: 'Data is required'
      });
    }

    const result = await qrGenerator.generateStyledQR(data, styleOptions);
    res.json(result);
  } catch (error) {
    console.error('Error generating styled QR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate styled QR code',
      error: error.message
    });
  }
});

// Generate multiple QR codes
app.post('/api/qr/generate/batch-multiple', async (req, res) => {
  try {
    const { batchDataArray, options } = req.body;
    
    if (!batchDataArray || !Array.isArray(batchDataArray)) {
      return res.status(400).json({
        success: false,
        message: 'Batch data array is required'
      });
    }

    const result = await qrGenerator.generateBatchQRCodes(batchDataArray, options);
    res.json(result);
  } catch (error) {
    console.error('Error generating multiple QR codes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate multiple QR codes',
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
  console.log(`🔗 QR Service running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 API docs: http://localhost:${PORT}/api/qr`);
});
