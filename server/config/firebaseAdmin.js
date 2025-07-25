import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load environment variables from the .env file in the project root directory
// This is important for process.env.FIREBASE_PROJECT_ID and local GOOGLE_APPLICATION_CREDENTIALS
dotenv.config({ path: resolve(process.cwd(), '..', '.env') });

let credentialsToUse; // This will hold the parsed JSON object for admin.initializeApp

// --- Priority 1: GOOGLE_APPLICATION_CREDENTIALS_JSON (for Render deployment) ---
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    credentialsToUse = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    console.log("Firebase Admin SDK: Loaded credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable (Render).");
  } catch (e) {
    console.error("Error parsing GOOGLE_APPLICATION_CREDENTIALS_JSON:", e);
    throw new Error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format. Please ensure it's valid JSON.");
  }
}
// --- Priority 2: GOOGLE_APPLICATION_CREDENTIALS (for local development via file path) ---
else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const serviceAccountPath = resolve(process.cwd(), process.env.GOOGLE_APPLICATION_CREDENTIALS);
  try {
    const fileContent = readFileSync(serviceAccountPath, 'utf8');
    credentialsToUse = JSON.parse(fileContent);
    console.log(`Firebase Admin SDK: Loaded credentials from local file: ${serviceAccountPath} (Local Dev).`);
  } catch (e) {
    console.error(`Error loading service account key from file ${serviceAccountPath}:`, e);
    throw new Error(`Failed to load Firebase service account key from file: ${serviceAccountPath}. Please ensure the file exists and is valid JSON.`);
  }
}
// --- Fallback: No credentials found ---
else {
  console.error("Warning: Neither GOOGLE_APPLICATION_CREDENTIALS_JSON nor GOOGLE_APPLICATION_CREDENTIALS environment variable is set.");
  throw new Error("Firebase Admin SDK credentials not configured. Please set GOOGLE_APPLICATION_CREDENTIALS_JSON (for Render) or GOOGLE_APPLICATION_CREDENTIALS (for local file).");
}

const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;

if (!firebaseProjectId) {
  throw new Error("FIREBASE_PROJECT_ID environment variable is not set.");
}

if (!admin.apps.length) {
  // Initialize Firebase Admin SDK using the determined credentials
  admin.initializeApp({
    credential: admin.credential.cert(credentialsToUse), // Use the parsed JSON object directly
    projectId: firebaseProjectId,
  });

  console.log('Firebase Admin SDK initialized with service account.');
}

const db = admin.firestore();

export { db };
