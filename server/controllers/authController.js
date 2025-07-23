import * as firestoreService from '../services/firestoreService.js';

// Collection name for user profiles in Firestore
const USERS_COLLECTION = 'users';


const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const userProfile = await firestoreService.getDocumentById(USERS_COLLECTION, userId);

    if (!userProfile) {
      const newProfile = {
        email: req.userEmail, 
        createdAt: firestoreService.admin.firestore.FieldValue.serverTimestamp(), 
      };
      await firestoreService.setDocument(USERS_COLLECTION, userId, newProfile);
      return res.status(200).json({ id: userId, ...newProfile });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile.', error: error.message });
  }
};


const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId; 
    const updateData = req.body; 

    delete updateData.id;
    delete updateData.email; 

    await firestoreService.updateDocument(USERS_COLLECTION, userId, updateData);

    const updatedProfile = await firestoreService.getDocumentById(USERS_COLLECTION, userId);

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update user profile.', error: error.message });
  }
};

export {
  getUserProfile,
  updateUserProfile,
};
