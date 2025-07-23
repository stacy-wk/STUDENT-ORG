import express from 'express';
import authRoutes from './authRoutes.js'; 
import calendarRoutes from './calendarRoutes.js';
import taskRoutes from './taskRoutes.js'; 


const router = express.Router();


router.use('/auth', authRoutes);
router.use('/calendar', calendarRoutes); 
router.use('/tasks', taskRoutes);


export default router;
