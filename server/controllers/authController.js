import * as firestoreService from '../services/firestoreService.js';
import admin from 'firebase-admin';

const USERS_COLLECTION = 'users';

const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(`[AuthController:getUserProfile] Attempting to fetch profile for userId: ${userId}`); 
    const userProfile = await firestoreService.getDocumentById(USERS_COLLECTION, userId);

    if (!userProfile) {
      console.log(`[AuthController:getUserProfile] No profile found for ${userId}, creating new one.`); 
      const newProfile = {
        email: req.userEmail,
        username: req.userEmail.split('@')[0],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };
      await firestoreService.setDocument(USERS_COLLECTION, userId, newProfile);
      return res.status(200).json({ id: userId, ...newProfile });
    }

    console.log(`[AuthController:getUserProfile] Profile found for ${userId}.`); 
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    console.error(error.stack); // full stack trace
    res.status(500).json({ message: 'Failed to fetch user profile.', error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = req.body;
    console.log(`[AuthController:updateUserProfile] Updating profile for userId: ${userId} with data:`, updateData); 

    delete updateData.id;
    delete updateData.email;

    await firestoreService.updateDocument(USERS_COLLECTION, userId, updateData);
    const updatedProfile = await firestoreService.getDocumentById(USERS_COLLECTION, userId);

    console.log(`[AuthController:updateUserProfile] Profile updated for ${userId}.`); 
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to update user profile.', error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    console.log(`[AuthController:getUserById] Fetching user by ID: ${targetUserId}`); 
    if (!targetUserId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const userProfile = await firestoreService.getDocumentById(USERS_COLLECTION, targetUserId);

    if (!userProfile) {
      console.log(`[AuthController:getUserById] User not found for ID: ${targetUserId}`); 
      return res.status(404).json({ message: 'User not found.' });
    }

    console.log(`[AuthController:getUserById] User found for ID: ${targetUserId}.`); 
    res.status(200).json({
      id: userProfile.id,
      username: userProfile.username,
      email: userProfile.email,
    });
  } catch (error) {
    console.error(`Error fetching user by ID ${req.params.userId}:`, error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to fetch user profile by ID.', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const searchTerm = req.query.search;
    console.log(`[AuthController:getUsers] Searching users for "${searchTerm}" by userId: ${userId}`); 

    let users = [];
    if (searchTerm && searchTerm.trim() !== '') {
      const usersRef = admin.firestore().collection(USERS_COLLECTION);
      const querySnapshot = await usersRef
        .where('username', '>=', searchTerm)
        .where('username', '<=', searchTerm + '\uf8ff')
        .limit(10)
        .get();

      users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        username: doc.data().username,
        email: doc.data().email,
      }));
    } else {
      console.log('[AuthController:getUsers] No search term provided.'); 
      users = [];
    }

    const filteredUsers = users.filter(user => user.id !== userId);
    console.log(`[AuthController:getUsers] Found ${filteredUsers.length} users for search term "${searchTerm}".`);
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error('Error searching users:', error.message);
    console.error(error.stack);
    res.status(500).json({ message: 'Failed to search users.', error: error.message });
  }
};

export {
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
};
