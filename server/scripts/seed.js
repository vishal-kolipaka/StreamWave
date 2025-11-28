import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Post from '../models/Post.js';
import Conversation from '../models/Conversation.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/streamwave';

const sampleUsers = [
  {
    username: 'alice_wonder',
    email: 'alice@example.com',
    password: 'password123',
    bio: 'Digital artist and streamer. Love creating visual stories!'
  },
  {
    username: 'bob_builder',
    email: 'bob@example.com',
    password: 'password123',
    bio: 'Building the future, one stream at a time 🛠️'
  },
  {
    username: 'charlie_cho',
    email: 'charlie@example.com',
    password: 'password123',
    bio: 'Music producer and audio enthusiast 🎵'
  },
  {
    username: 'diana_dev',
    email: 'diana@example.com',
    password: 'password123',
    bio: 'Full-stack developer | Open source contributor'
  }
];

const samplePosts = [
  {
    type: 'image',
    title: 'Sunset at the beach',
    caption: 'Golden hour never fails to amaze me. What a beautiful evening! 🌅',
    author: 'alice_wonder',
    tags: ['sunset', 'beach', 'photography']
  },
  {
    type: 'video',
    title: 'Building a React Component Live',
    caption: 'Live coding session: Building a responsive navigation component from scratch. Full tutorial coming soon!',
    author: 'bob_builder',
    tags: ['react', 'coding', 'tutorial']
  },
  {
    type: 'audio',
    title: 'Chill Lofi Mix',
    caption: 'New lofi track I\'ve been working on. Perfect for coding sessions! 🎧',
    author: 'charlie_cho',
    tags: ['lofi', 'music', 'chill']
  },
  {
    type: 'blog',
    title: 'The Future of Web Development',
    caption: 'Exploring the latest trends in web development and what they mean for developers in 2024. From WebAssembly to edge computing, the landscape is changing rapidly.',
    author: 'diana_dev',
    tags: ['webdev', 'technology', 'future']
  },
  {
    type: 'image',
    title: 'Mountain Hike',
    caption: 'Weekend well spent in the mountains! The view was absolutely worth the climb. 🏔️',
    author: 'alice_wonder',
    tags: ['hiking', 'mountains', 'nature']
  },
  {
    type: 'video',
    title: 'JavaScript Tips & Tricks',
    caption: 'Sharing some lesser-known JavaScript features that can make your code cleaner and more efficient.',
    author: 'bob_builder',
    tags: ['javascript', 'programming', 'tips']
  }
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Conversation.deleteMany({});

    console.log('Cleared existing data');

    // Create users
    const createdUsers = {};

    for (const userData of sampleUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const user = new User({
        username: userData.username,
        email: userData.email,
        passwordHash,
        bio: userData.bio,
        avatarUrl: `/uploads/avatars/${userData.username}.jpg`
      });

      await user.save();
      createdUsers[userData.username] = user;
      console.log(`Created user: ${userData.username}`);
    }

    // Create follow relationships
    await User.findByIdAndUpdate(createdUsers.bob_builder._id, {
      $push: { followers: createdUsers.alice_wonder._id }
    });
    await User.findByIdAndUpdate(createdUsers.alice_wonder._id, {
      $push: { following: createdUsers.bob_builder._id }
    });

    await User.findByIdAndUpdate(createdUsers.charlie_cho._id, {
      $push: {
        followers: [createdUsers.alice_wonder._id, createdUsers.diana_dev._id]
      }
    });
    await User.findByIdAndUpdate(createdUsers.alice_wonder._id, {
      $push: { following: createdUsers.charlie_cho._id }
    });
    await User.findByIdAndUpdate(createdUsers.diana_dev._id, {
      $push: { following: createdUsers.charlie_cho._id }
    });

    console.log('Created follow relationships');

    // Create posts
    for (const postData of samplePosts) {
      const author = createdUsers[postData.author];
      const post = new Post({
        author: author._id,
        type: postData.type,
        title: postData.title,
        caption: postData.caption,
        tags: postData.tags,
        media: {
          url: `/uploads/sample/${postData.type}-${Date.now()}.${postData.type === 'audio' ? 'mp3' : postData.type === 'video' ? 'mp4' : 'jpg'}`,
          thumbnail: `/uploads/sample/thumb-${Date.now()}.jpg`
        },
        likes: [createdUsers.bob_builder._id, createdUsers.charlie_cho._id].slice(0, Math.floor(Math.random() * 3)),
        comments: [
          {
            user: createdUsers.bob_builder._id,
            text: 'Great content! Looking forward to more.'
          }
        ],
        shares: Math.floor(Math.random() * 10)
      });

      await post.save();
      console.log(`Created post: ${postData.title}`);
    }

    // Create sample conversation
    const conversation = new Conversation({
      participants: [createdUsers.alice_wonder._id, createdUsers.bob_builder._id],
      messages: [
        {
          from: createdUsers.alice_wonder._id,
          text: 'Hey Bob! Loved your React tutorial stream today.',
          createdAt: new Date(Date.now() - 3600000) // 1 hour ago
        },
        {
          from: createdUsers.bob_builder._id,
          text: 'Thanks Alice! Glad you enjoyed it. Working on the next one about state management.',
          createdAt: new Date(Date.now() - 1800000) // 30 minutes ago
        },
        {
          from: createdUsers.alice_wonder._id,
          text: 'Can\'t wait! Let me know if you need any design help.',
          createdAt: new Date()
        }
      ],
      unreadCounts: new Map([
        [createdUsers.alice_wonder._id.toString(), 0],
        [createdUsers.bob_builder._id.toString(), 1]
      ])
    });

    await conversation.save();
    console.log('Created sample conversation');

    console.log('\n🎉 Seed data created successfully!');
    console.log('\nSample login credentials:');
    console.log('Username: alice_wonder, Password: password123');
    console.log('Username: bob_builder, Password: password123');
    console.log('Username: charlie_cho, Password: password123');
    console.log('Username: diana_dev, Password: password123');
    console.log('\nStart the server with: npm run dev');
    console.log('Start the media worker with: npm run worker');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedDatabase();
