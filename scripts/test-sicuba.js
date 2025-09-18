/**
 * Test script untuk SiCuba integration
 * Jalankan dengan: node scripts/test-sicuba.js
 */

require('dotenv').config({ path: '.env.local' });
const { sendWhatsApp } = require('../lib/notify/sicuba');

async function testSiCubaIntegration() {
  console.log('🧪 Testing SiCuba Integration...');
  console.log('📋 Environment Variables:');
  console.log('- SICUBA_API_TOKEN:', process.env.SICUBA_API_TOKEN ? '✅ Set' : '❌ Missing');
  console.log('- SICUBA_CAMPAIGN_ID:', process.env.SICUBA_CAMPAIGN_ID ? '✅ Set' : '❌ Missing');
  
  if (!process.env.SICUBA_API_TOKEN || !process.env.SICUBA_CAMPAIGN_ID) {
    console.error('❌ Missing required environment variables!');
    console.log('Please set SICUBA_API_TOKEN and SICUBA_CAMPAIGN_ID in .env.local');
    return;
  }

  // Test data - test dengan nomor yang diminta user
  const testData = {
    to: '+6281212526287', // Test dengan nomor yang diminta user
    name: 'Test User',
    campaign_id: process.env.SICUBA_CAMPAIGN_ID,
    customFields: {
      tracking_code: 'WS-TEST-123456',
      jenis_layanan: 'KTP',
      status: 'Pengajuan Baru',
      tracking_url: `${process.env.APP_BASE_URL || 'http://localhost:3000'}/public?tab=status&tracking_code=WS-TEST-123456`
    }
  };

  console.log('\n📤 Sending test message...');
  console.log('Test data:', JSON.stringify(testData, null, 2));

  try {
    const result = await sendWhatsApp(testData);
    
    console.log('\n📥 Result:');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ Test successful! Check your WhatsApp.');
    } else {
      console.log('❌ Test failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

// Run test
testSiCubaIntegration();
