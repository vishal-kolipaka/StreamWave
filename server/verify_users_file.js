import mongoose from 'mongoose';
import User from './models/User.js';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const verify = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streamwave');
    const users = await User.find({}, 'username');
    const userList = users.map(u => u.username).join(', ');
    fs.writeFileSync('user_count.txt', `Count: ${users.length}\nUsers: ${userList}`);
    console.log(`Count: ${users.length}`);
    console.log(`Users: ${userList}`);
    process.exit(0);
  } catch (error) {
    fs.writeFileSync('user_count.txt', `Error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

verify();
