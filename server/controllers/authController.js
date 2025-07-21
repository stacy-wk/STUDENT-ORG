// server/controllers/authController.js

// Import the Firestore service to interact with the database
import * as firestoreService from '../services/firestoreService.js';

// Define the collection name for user profiles in Firestore
const USERS_COLLECTION = 'users';

/**
 * @desc Get the profile of the authenticated user
 * @route GET /api/auth/profile
 * @access Private (requires authentication)
 * @returns {Object} User profile data
 */
const getUserProfile = async (req, res) => {
  try {
    // The userId is attached to the request object by the authMiddleware
    const userId = req.userId;

    // Fetch the user's profile document from Firestore
    const userProfile = await firestoreService.getDocumentById(USERS_COLLECTION, userId);

    if (!userProfile) {
      // If user profile doesn't exist (e.g., new user), create a basic one
      // In a real app, you might prompt the user to complete their profile on first login
      const newProfile = {
        email: req.userEmail, // Use email from decoded token
        createdAt: firestoreService.admin.firestore.FieldValue.serverTimestamp(), // Add timestamp
        // Add other default fields as needed
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

/**
 * @desc Update the profile of the authenticated user
 * @route PUT /api/auth/profile
 * @access Private (requires authentication)
 * @param {Object} req.body - Fields to update (e.g., { name: 'John Doe', university: 'XYZ Uni' })
 * @returns {Object} Updated user profile data
 */
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId; // Get user ID from authenticated request
    const updateData = req.body; // Data sent from the client to update

    // Ensure we don't allow updating sensitive fields like ID or email directly from here
    delete updateData.id;
    delete updateData.email; // Email should be managed by Firebase Auth

    // Update the user's profile document in Firestore
    await firestoreService.updateDocument(USERS_COLLECTION, userId, updateData);

    // Fetch the updated profile to send back the latest data
    const updatedProfile = await firestoreService.getDocumentById(USERS_COLLECTION, userId);

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Failed to update user profile.', error: error.message });
  }
};

// Export the controller functions
export {
  getUserProfile,
  updateUserProfile,
};
