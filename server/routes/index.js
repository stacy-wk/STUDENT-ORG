import express from 'express';
import authRoutes from './authRoutes.js'; 
import calendarRoutes from './calendarRoutes.js';
import taskRoutes from './taskRoutes.js'; 
import chatRoutes from './chatRoutes.js';
import mentalHealthRoutes from './mentalHealthRoutes.js';
import financeRoutes from './financeRoutes.js';
import notificationRoutes from './notificationRoutes.js';


const router = express.Router();


router.use('/auth', authRoutes);
router.use('/calendar', calendarRoutes); 
router.use('/tasks', taskRoutes);
router.use('/chat', chatRoutes);
router.use('/mental-health', mentalHealthRoutes);
router.use('/finance', financeRoutes);
router.use('/notifications', notificationRoutes);


export default router;
