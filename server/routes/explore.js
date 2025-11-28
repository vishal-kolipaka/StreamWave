import express from 'express';
import Post from '../models/Post.js';

const router = express.Router();

router.get('/videos', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const videos = await Post.find({ type: 'video', isPublic: true })
      .populate('author', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos' });
  }
});

router.get('/music', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const music = await Post.find({ type: 'audio', isPublic: true })
      .populate('author', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(music);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching music' });
  }
});

router.get('/blogs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const blogs = await Post.find({ type: 'blog', isPublic: true })
      .populate('author', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching blogs' });
  }
});

export default router;
