import express from 'express';
import {
  getUser,
  searchUsers,
  toggleFollow,
  getFollowers,
  getFollowing
} from '../controllers/userController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/search', searchUsers);
router.get('/:id', optionalAuth, getUser);
router.post('/:id/follow', authenticateToken, toggleFollow);
router.get('/:id/followers', getFollowers);
router.get('/:id/following', getFollowing);

export default router;
