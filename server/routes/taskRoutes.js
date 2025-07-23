import express from 'express';
import { getTasks, addTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { authenticateToken } from '../middleware/authMiddleware.js'; 

const router = express.Router();


router.get('/', authenticateToken, getTasks);
router.post('/', authenticateToken, addTask);
router.put('/:taskId', authenticateToken, updateTask);
router.delete('/:taskId', authenticateToken, deleteTask);

export default router;
