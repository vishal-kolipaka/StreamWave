import express from 'express';
import { body } from 'express-validator';
import {
  createPost,
  getFeed,
  getPost,
  toggleLike,
  addComment,
  sharePost,
  deletePost,
  getUserPosts
} from '../controllers/postController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication except getFeed and getPost
router.post('/',
  authenticateToken,
  [
    body('type').isIn(['image', 'video', 'audio', 'blog']).withMessage('Invalid post type'),
    body('title').optional().isLength({ max: 200 }).withMessage('Title too long'),
    body('caption').optional().isLength({ max: 2200 }).withMessage('Caption too long')
  ],
  createPost
);

router.get('/feed', optionalAuth, getFeed);
router.get('/user/:id', optionalAuth, getUserPosts);
router.get('/:id', optionalAuth, getPost);
router.post('/:id/like', authenticateToken, toggleLike);
router.post('/:id/comment',
  authenticateToken,
  [body('text').notEmpty().withMessage('Comment text is required')],
  addComment
);
router.post('/:id/share', authenticateToken, sharePost);
router.delete('/:id', authenticateToken, deletePost);

export default router;
