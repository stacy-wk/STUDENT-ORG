import express from 'express';
import { getUserProfile, updateUserProfile, getUsers, getUserById } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import admin from 'firebase-admin';

const router = express.Router();


router.get('/profile', authenticateToken, getUserProfile); 
router.put('/profile', authenticateToken, updateUserProfile); 
router.get('/users', authenticateToken, getUsers);
router.get('/users/:userId', authenticateToken, getUserById);


// Create profile route after Signup
router.post('/create-profile', authenticateToken, async (req, res) => {
  try {
    const { uid, email, username } = req.body;

    if (!uid || !email || !username) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const db = admin.firestore();
    const userRef = db.doc(`users/${uid}`);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.status(409).json({ message: 'Profile already exists.' });
    }

    await userRef.set({
      email,
      username,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(201).json({ message: 'Profile created successfully!' });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

export default router;
