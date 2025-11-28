// Quick diagnostic script to test all critical endpoints
import axios from 'axios';

const baseURL = 'http://localhost:5000/api';

const testEndpoints = async () => {
  console.log('Testing API endpoints...\n');

  // Test 1: Server health
  try {
    const res = await axios.get(`${baseURL}/posts/feed`);
    console.log('✅ Server is running');
    console.log(`   Feed returned ${res.data.posts?.length || 0} posts`);
  } catch (err) {
    console.log('❌ Server not responding:', err.message);
    return;
  }

  // Test 2: Auth endpoint
  try {
    const res = await axios.get(`${baseURL}/auth/me`, {
      headers: { Authorization: `Bearer fake-token` }
    });
    console.log('✅ Auth endpoint accessible');
  } catch (err) {
    if (err.response?.status === 401) {
      console.log('✅ Auth endpoint working (401 expected without valid token)');
    } else {
      console.log('❌ Auth endpoint error:', err.message);
    }
  }

  // Test 3: User search
  try {
    const res = await axios.get(`${baseURL}/users/search?q=a`);
    console.log(`✅ User search working (${res.data.length} users found)`);
  } catch (err) {
    console.log('❌ User search failed:', err.message);
  }

  console.log('\nDiagnostic complete!');
};

testEndpoints();
