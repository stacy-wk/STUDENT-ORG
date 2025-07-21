// server/config/firebaseAdmin.js

// Import the Firebase Admin SDK
import admin from 'firebase-admin';
// Import dotenv to ensure environment variables are loaded (good practice)
import dotenv from 'dotenv';
// Import the service account key JSON file
// IMPORTANT: Ensure this path is correct relative to this file.
// Make sure 'serviceAccountKey.json' is in the same 'config' directory.
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

// Load environment variables from the .env file at the project root
dotenv.config({ path: '../.env' });

// Get the Firebase Project ID from environment variables (still useful for clarity)
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;

// Check if Firebase Admin SDK has already been initialized
if (!admin.apps.length) {
  // Initialize the Firebase Admin SDK using the service account credentials
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount), // Use the imported serviceAccount object
    projectId: firebaseProjectId, // Specify the project ID
  });

  console.log('Firebase Admin SDK initialized with service account.');
}

// Get the Firestore database instance
const db = admin.firestore();

// Export the Firestore database instance
export { db };
