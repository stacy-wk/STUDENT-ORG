import express from 'express';
import { getMessages, getChatRooms, createChatRoom, createPrivateChat, addMemberToChatRoom } from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';


const router = express.Router();


router.get('/rooms', authenticateToken, getChatRooms);
router.post('/rooms', authenticateToken, createChatRoom);
router.post('/private', authenticateToken, createPrivateChat); 
router.post('/rooms/:roomId/members', authenticateToken, addMemberToChatRoom);
router.get('/messages/:roomId', authenticateToken, getMessages);

export default router;
