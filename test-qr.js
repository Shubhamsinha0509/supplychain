const QRGenerator = require('./packages/qr-service/src/qrGenerator');

async function testQRGeneration() {
  console.log('🧪 Testing QR Code Generation...\n');
  
  const qrGenerator = new QRGenerator();
  
  // Sample batch data
  const batchData = {
    batchId: 'BCH001',
    produceType: 'Tomatoes',
    farmer: 'John Doe',
    harvestDate: '2025-10-01',
    qualityGrade: 'A',
    quantity: 100,
    location: 'California Farm',
    status: 'REGISTERED',
    ipfsHash: 'QmTestHash123',
    timestamp: new Date().toISOString(),
    blockchain: {
      onBlockchain: true,
      transactionHash: '0x1234567890abcdef',
      blockNumber: 12345
    }
  };

  try {
    const result = await qrGenerator.generateBatchQR(batchData);
    
    if (result.success) {
      console.log('✅ QR Code Generated Successfully!\n');
      
      // Parse and display the QR payload
      const payload = JSON.parse(result.data.qrPayload);
      
      console.log('📋 QR Code Contains:');
      console.log('==================');
      console.log('Type:', payload.type);
      console.log('Version:', payload.version);
      console.log('\n📊 Batch Data:');
      console.log('Batch ID:', payload.data.batchId);
      console.log('Produce:', payload.data.produceType);
      console.log('Farmer:', payload.data.farmer);
      console.log('Quantity:', payload.data.quantity, 'kg');
      console.log('Quality Grade:', payload.data.qualityGrade);
      console.log('Location:', payload.data.location);
      console.log('Status:', payload.data.status);
      console.log('Harvest Date:', payload.data.harvestDate);
      console.log('Blockchain:', payload.data.blockchain ? 'Yes' : 'No');
      
      console.log('\n🔗 URLs:');
      console.log('Scan URL:', payload.urls.scan);
      console.log('API URL:', payload.urls.api);
      console.log('Web URL:', payload.urls.web);
      console.log('Blockchain URL:', payload.urls.blockchain);
      
      console.log('\n🔐 Security:');
      console.log('Signature:', payload.signature.substring(0, 20) + '...');
      
      console.log('\n📱 QR Code Info:');
      console.log('QR ID:', result.data.qrId);
      console.log('Data URL Length:', result.data.qrCodeDataURL.length, 'characters');
      console.log('Generated At:', result.data.metadata.generatedAt);
      
      console.log('\n🎯 What Wholesalers Can See:');
      console.log('• Complete batch information');
      console.log('• Farmer details and location');
      console.log('• Quality grade and quantity');
      console.log('• Harvest date and current status');
      console.log('• Blockchain verification status');
      console.log('• Direct links to detailed data');
      console.log('• Secure signature verification');
      
    } else {
      console.log('❌ QR Code generation failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testQRGeneration();
