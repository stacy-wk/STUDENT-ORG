// import admin from 'firebase-admin';

// let serviceAccount;

// // Check for the GOOGLE_APPLICATION_CREDENTIALS_JSON variable for deployment
// if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
//   try {
//     // Parse the JSON string from the environment variable
//     serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
//     console.log("Firebase Admin SDK: Loaded credentials from GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable (Render).");
//   } catch (e) {
//     console.error("Error parsing Firebase service account key from environment variable:", e);
//     // Exit the process if parsing fails
//     throw new Error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format. Please ensure it's valid JSON.");
//   }
// } 
// // Fallback to the GOOGLE_APPLICATION_CREDENTIALS variable for local development
// else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
//   try {
//     // Dynamically load the service account key file
//     const serviceAccountPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
//     serviceAccount = require(serviceAccountPath);
//     console.log(`Firebase Admin SDK: Loaded credentials from local file: ${serviceAccountPath} (Local Dev).`);
//   } catch (e) {
//     console.error(`Error loading Firebase service account key from file ${process.env.GOOGLE_APPLICATION_CREDENTIALS}:`, e);
//     // Exit the process if the file can't be found
//     throw new Error(`Failed to load Firebase service account key from file. Please ensure the file exists and is valid JSON.`);
//   }
// } 
// // Handle the case where no credentials are set
// else {
//   throw new Error("Firebase Admin SDK credentials not configured. Please set GOOGLE_APPLICATION_CREDENTIALS_JSON (for Render) or GOOGLE_APPLICATION_CREDENTIALS (for local file).");
// }

// // Initialize the Firebase app
// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });
//   console.log("Firebase Admin SDK initialized with service account.");
// } else {
//   console.log("Firebase Admin SDK already initialized.");
// }

// export const db = admin.firestore();
// export const auth = admin.auth();


import admin from "firebase-admin";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables from .env (for local development)
dotenv.config();

let serviceAccount;

// 🔹 For Render Deployment: use JSON string in env variable
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  try {
    serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    console.log("✅ Firebase Admin SDK: Loaded credentials from Render environment variable.");
  } catch (e) {
    console.error("❌ Error parsing Firebase JSON from GOOGLE_APPLICATION_CREDENTIALS_JSON:", e);
    throw new Error("Invalid GOOGLE_APPLICATION_CREDENTIALS_JSON format.");
  }
}
// 🔹 For Local Development: load JSON file path from env
else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const serviceAccountPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    const fileContents = fs.readFileSync(serviceAccountPath, "utf8");
    serviceAccount = JSON.parse(fileContents);
    console.log(`✅ Firebase Admin SDK: Loaded credentials from local file: ${serviceAccountPath}`);
  } catch (e) {
    console.error("❌ Error loading Firebase service account key:", e);
    throw new Error("Failed to load Firebase service account key. Check your local file path.");
  }
}
// 🔹 If neither variable is set
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
  console.log("🔥 Firebase Admin SDK initialized successfully!");
} else {
  console.log("ℹ️ Firebase Admin SDK already initialized.");
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;

