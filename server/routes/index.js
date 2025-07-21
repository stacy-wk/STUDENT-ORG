// server/routes/index.js

import express from 'express';
import authRoutes from './authRoutes.js'; // Import your authentication routes

const router = express.Router();

// Mount individual route modules
// All routes defined in authRoutes will be prefixed with '/auth'
router.use('/auth', authRoutes);

// TODO: Add other route modules here as you create them
// router.use('/academic', academicRoutes);
// router.use('/finance', financeRoutes);
// router.use('/groups', groupRoutes);
// router.use('/tasks', taskRoutes);
// router.use('/mental-health', mentalHealthRoutes);

// Export the main API router
export default router;
