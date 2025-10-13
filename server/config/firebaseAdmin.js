import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// environment variables from .env 
dotenv.config();

let serviceAccount;

// For Render
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    console.log("Firebase Admin SDK: Loaded credentials from Render environment variable.");
  } catch (e) {
    console.error("Error parsing Firebase JSON from GOOGLE_APPLICATION_CREDENTIALS_JSON:", e);
    throw new Error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format.");
  }
}
// For Local Dev
else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const serviceAccountPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const fileContents = fs.readFileSync(serviceAccountPath, "utf8");
    serviceAccount = JSON.parse(fileContents);
    console.log(`Firebase Admin SDK: Loaded credentials from local file: ${serviceAccountPath}`);
  } catch (e) {
    console.error("Error loading Firebase service account key:", e);
    throw new Error("Failed to load Firebase service account key. Check your local file path.");
  }
}
// If neither variable is set
else {
  throw new Error(
    "Firebase Admin SDK credentials not configured. Set GOOGLE_APPLICATION_CREDENTIALS_JSON (Render) or GOOGLE_APPLICATION_CREDENTIALS (local)."
  );
}

// Initialize Firebase
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("Firebase Admin SDK initialized successfully!");
} else {
  console.log("Firebase Admin SDK already initialized.");
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;

