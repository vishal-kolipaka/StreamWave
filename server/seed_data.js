
import mongoose from 'mongoose';
import User from './models/User.js';
import Post from './models/Post.js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/streamwave');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});

    // Create users
    const passwordHash = await bcrypt.hash('password123', 10);

    const user1 = await User.create({
      username: 'alice',
      email: 'alice@example.com',
      passwordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      bio: 'Hello world!'
    });

    const user2 = await User.create({
      username: 'bob',
      email: 'bob@example.com',
      passwordHash,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      bio: 'I love coding.'
    });

    // Create posts
    await Post.create({
      author: user1._id,
      type: 'image',
      title: 'My first post',
      caption: 'This is a test post.',
      media: { url: 'https://picsum.photos/seed/1/800/600' },
      isPublic: true
    });

    await Post.create({
      author: user2._id,
      type: 'image',
      title: 'Bob\'s post',
      caption: 'Another test post.',
      media: { url: 'https://picsum.photos/seed/2/800/600' },
      isPublic: true
    });

    console.log('Database seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding:', error);
    process.exit(1);
  }
};

seed();
