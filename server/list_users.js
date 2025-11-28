import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streamwave')
  .then(async () => {
    const users = await User.find().select('username email createdAt');
    console.log(`\n📊 Total users in database: ${users.length}\n`);

    if (users.length === 0) {
      console.log('❌ Database is empty! No users found.\n');
    } else {
      users.forEach((user, i) => {
        console.log(`${i + 1}. ${user.username}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Created: ${user.createdAt}\n`);
      });
    }

    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
