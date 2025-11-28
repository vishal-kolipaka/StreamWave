import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streamwave');
    console.log('Connected to MongoDB');

    const users = await User.find().select('username email avatarUrl bio createdAt');
    console.log(`\nTotal users in database: ${users.length}\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} (${user.email || 'no email'})`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('');
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
