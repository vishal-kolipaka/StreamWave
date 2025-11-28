import express from 'express';
import { getNotifications, markRead } from '../controllers/notificationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getNotifications);
router.post('/mark-read', markRead);

export default router;
