// Script to check what's causing the 500 error
import mongoose from 'mongoose';
import User from './models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const testAuth = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streamwave');
    console.log('✅ Connected to MongoDB\n');

    // Get a user
    const user = await User.findOne();
    if (!user) {
      console.log('❌ No users in database!');
      return;
    }

    console.log(`Found user: ${user.username} (${user._id})`);
    console.log(`Followers: ${user.followers?.length || 0}`);
    console.log(`Following: ${user.following?.length || 0}\n`);

    // Try to populate
    try {
      const populated = await user.populate('followers', 'username avatarUrl');
      console.log('✅ Populate followers succeeded');
    } catch (err) {
      console.log('❌ Populate followers failed:', err.message);
    }

    try {
      const populated = await user.populate('following', 'username avatarUrl');
      console.log('✅ Populate following succeeded');
    } catch (err) {
      console.log('❌ Populate following failed:', err.message);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

testAuth();
