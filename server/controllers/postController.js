import { validationResult } from 'express-validator';
import Post from '../models/Post.js';
import Notification from '../models/Notification.js';

export const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, title, caption, media, tags } = req.body;

    const post = new Post({
      author: req.user._id,
      type,
      title,
      caption,
      media,
      tags: tags || []
    });

    await post.save();
    await post.populate('author', 'username avatarUrl');

    res.status(201).json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getFeed = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const followingOnly = req.query.following === 'true';

    let query = { isPublic: true };

    if (followingOnly && req.user) {
      query.author = { $in: req.user.following };
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get feed error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatarUrl')
      .populate('comments.user', 'username avatarUrl')
      .populate('likes', 'username avatarUrl');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id;
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);

      // Create notification for like
      if (post.author.toString() !== userId.toString()) {
        const notification = new Notification({
          userId: post.author,
          type: 'like',
          actorId: userId,
          targetId: post._id,
          targetType: 'post'
        });
        await notification.save();
      }
    }

    await post.save();
    res.json({ liked: !hasLiked, likeCount: post.likes.length });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const addComment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      user: req.user._id,
      text: req.body.text
    };

    post.comments.push(comment);
    await post.save();

    await post.populate('comments.user', 'username avatarUrl');

    const newComment = post.comments[post.comments.length - 1];

    // Create notification for comment
    if (post.author.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        userId: post.author,
        type: 'comment',
        actorId: req.user._id,
        targetId: post._id,
        targetType: 'post'
      });
      await notification.save();
    }

    res.status(201).json(newComment);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const sharePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.shares += 1;
    await post.save();

    res.json({ shares: post.shares });
  } catch (error) {
    console.error('Share post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check ownership or admin role
    if (post.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: id, isPublic: true })
      .populate('author', 'username avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: id, isPublic: true });

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user posts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
