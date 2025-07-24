import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  addNotification,
  getNotifications,
  markAsRead,
  deleteNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

router.post('/', authenticateToken, addNotification);
router.get('/', authenticateToken, getNotifications);
router.put('/:id/read', authenticateToken, markAsRead);
router.delete('/:id', authenticateToken, deleteNotification);

export default router;
