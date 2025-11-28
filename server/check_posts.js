
import mongoose from 'mongoose';
import Post from './models/Post.js';
import dotenv from 'dotenv';

dotenv.config();

const checkPosts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streamwave');
    console.log('Connected to MongoDB');

    const count = await Post.countDocuments();
    console.log(`Total posts: ${count}`);

    const posts = await Post.find().limit(5);
    console.log('Sample posts:', posts);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkPosts();
