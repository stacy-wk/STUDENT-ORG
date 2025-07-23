import admin from 'firebase-admin';
import dotenv from 'dotenv';
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

dotenv.config({ path: '../.env' });

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;

if (!admin.apps.length) {
  // Init Firebase Admin SDK using service account credentials
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: firebaseProjectId, 
  });

  console.log('Firebase Admin SDK initialized with service account.');
}

const db = admin.firestore();

export { db };
