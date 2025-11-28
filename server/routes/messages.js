import express from 'express';
import { getConversations, getConversationWithUser, getMessages, sendMessage } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/conversations', getConversations);
router.get('/with/:userId', getConversationWithUser);
router.get('/:threadId', getMessages);
router.post('/', sendMessage);

export default router;
