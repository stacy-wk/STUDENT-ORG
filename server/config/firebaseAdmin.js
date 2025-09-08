import admin from 'firebase-admin';

let serviceAccount;

// Check for the GOOGLE_APPLICATION_CREDENTIALS_JSON variable for deployment
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    // Parse the JSON string from the environment variable
    serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    console.log("Firebase Admin SDK: Loaded credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable (Render).");
  } catch (e) {
    console.error("Error parsing Firebase service account key from environment variable:", e);
    // Exit the process if parsing fails
    throw new Error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format. Please ensure it's valid JSON.");
  }
} 
// Fallback to the GOOGLE_APPLICATION_CREDENTIALS variable for local development
else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    // Dynamically load the service account key file
    const serviceAccountPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    serviceAccount = require(serviceAccountPath);
    console.log(`Firebase Admin SDK: Loaded credentials from local file: ${serviceAccountPath} (Local Dev).`);
  } catch (e) {
    console.error(`Error loading Firebase service account key from file ${process.env.GOOGLE_APPLICATION_CREDENTIALS}:`, e);
    // Exit the process if the file can't be found
    throw new Error(`Failed to load Firebase service account key from file. Please ensure the file exists and is valid JSON.`);
  }
} 
// Handle the case where no credentials are set
else {
  throw new Error("Firebase Admin SDK credentials not configured. Please set GOOGLE_APPLICATION_CREDENTIALS_JSON (for Render) or GOOGLE_APPLICATION_CREDENTIALS (for local file).");
}

// Initialize the Firebase app
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log("Firebase Admin SDK initialized with service account.");
} else {
  console.log("Firebase Admin SDK already initialized.");
}

export const db = admin.firestore();
export const auth = admin.auth();