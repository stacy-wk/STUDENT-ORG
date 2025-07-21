// server/routes/authRoutes.js

import express from 'express'; // Import Express to create a router
import { getUserProfile, updateUserProfile } from '../controllers/authController.js'; // Import controller functions
import { protect } from '../middleware/authMiddleware.js'; // Import the authentication middleware

// Create an Express router instance
const router = express.Router();

// Define routes for user profile management
// All routes here will be prefixed with '/api/auth' when mounted in app.js

// GET /api/auth/profile - Get the authenticated user's profile
// This route is protected, meaning only authenticated users can access it.
router.get('/profile', protect, getUserProfile);

// PUT /api/auth/profile - Update the authenticated user's profile
// This route is also protected.
router.put('/profile', protect, updateUserProfile);

// Export the router
export default router;
