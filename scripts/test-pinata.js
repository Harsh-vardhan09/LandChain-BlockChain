#!/usr/bin/env node

require('dotenv').config();
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testPinataConnection() {
  console.log('\n🧪 PINATA CREDENTIALS TEST\n');
  console.log('═'.repeat(50));

  const apiKey = process.env.PINATA_API_KEY;
  const secretKey = process.env.PINATA_SECRET_API_KEY;

  // Check 1: Credentials exist
  console.log('\n✓ Check 1: Credentials Loaded');
  if (!apiKey || !secretKey) {
    console.error('❌ FAILED: Missing environment variables');
    console.error('   - PINATA_API_KEY:', apiKey ? '✓' : '✗');
    console.error('   - PINATA_SECRET_API_KEY:', secretKey ? '✓' : '✗');
    process.exit(1);
  }
  console.log('   ✓ API Key found:', apiKey.substring(0, 8) + '...');
  console.log('   ✓ Secret Key found:', secretKey.substring(0, 8) + '...');

  // Check 2: Test connectivity to Pinata
  console.log('\n✓ Check 2: Pinata API Connectivity');
  try {
    // Try a simple test upload with a minimal file
    const buffer = Buffer.from('test content');
    const formData = new FormData();
    formData.append('file', buffer, { filename: 'test.txt' });

    console.log('   Attempting upload to Pinata...');
    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          ...formData.getHeaders(),
          pinata_api_key: apiKey,
          pinata_secret_api_key: secretKey
        },
        timeout: 10000
      }
    );

    console.log('   ✓ Upload successful!');
    console.log('   ✓ IPFS Hash:', response.data.IpfsHash);
    console.log('   ✓ Gateway URL: https://gateway.pinata.cloud/ipfs/' + response.data.IpfsHash);

    console.log('\n' + '═'.repeat(50));
    console.log('✅ ALL CHECKS PASSED - Pinata is working correctly!\n');
    process.exit(0);

  } catch (error) {
    console.error('   ❌ Upload failed');
    console.error('\n   Error Details:');
    if (error.response) {
      console.error('   Status:', error.response.status, error.response.statusText);
      console.error('   Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('   Headers:', error.response.headers);

      // Provide specific guidance based on error
      console.log('\n   📋 Troubleshooting:');
      if (error.response.status === 401) {
        console.error('   → Invalid API credentials. Check your PINATA_API_KEY and PINATA_SECRET_API_KEY');
      } else if (error.response.status === 429) {
        console.error('   → Rate limited. Check your Pinata account quota');
      } else if (error.response.status === 403) {
        console.error('   → Forbidden. Check IP whitelisting in Pinata settings');
      }
    } else {
      console.error('   Network Error:', error.message);
      console.error('   → Check your internet connection');
      console.error('   → Check if api.pinata.cloud is accessible');
    }

    console.log('\n' + '═'.repeat(50));
    console.log('❌ PINATA TEST FAILED\n');
    process.exit(1);
  }
}

testPinataConnection();
