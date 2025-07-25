import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';


dotenv.config({ path: resolve(process.cwd(), '..', '.env') });

let serviceAccountCredentials; 


if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    serviceAccountCredentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    console.log("Firebase Admin SDK: Loaded credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.");
  } catch (e) {
    console.error("Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:", e);
    throw new Error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format. Please ensure it's valid JSON.");
  }
}

else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const serviceAccountPath = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
  try {
    const fileContent = readFileSync(serviceAccountPath, 'utf8');
    serviceAccountCredentials = JSON.parse(fileContent);
    console.log(`Firebase Admin SDK: Loaded credentials from local file: ${serviceAccountPath}`);
  } catch (e) {
    console.error(`Error loading service account key from file ${serviceAccountPath}:`, e);
    throw new Error(`Failed to load Firebase service account key from file: ${serviceAccountPath}. Please ensure the file exists and is valid JSON.`);
  }
}

else {
  console.error("Warning: Neither GOOGLE_APPLICATION_CREDENTIALS_JSON nor GOOGLE_APPLICATION_CREDENTIALS environment variable is set.");
  throw new Error("Firebase Admin SDK credentials not configured. Please set GOOGLE_APPLICATION_CREDENTIALS_JSON or GOOGLE_APPLICATION_CREDENTIALS.");
}

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;

if (!firebaseProjectId) {
  throw new Error("FIREBASE_PROJECT_ID environment variable is not set.");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountCredentials), 
    projectId: firebaseProjectId,
  });

  console.log('Firebase Admin SDK initialized with service account.');
}

const db = admin.firestore();

export { db };
