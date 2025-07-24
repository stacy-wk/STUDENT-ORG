import express from 'express';
import { getUserProfile, updateUserProfile, getUsers, getUserById } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/profile', authenticateToken, getUserProfile); 
router.put('/profile', authenticateToken, updateUserProfile); 
router.get('/users', authenticateToken, getUsers);
router.get('/users/:userId', authenticateToken, getUserById);

export default router;
