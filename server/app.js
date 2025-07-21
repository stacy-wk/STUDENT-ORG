// server/app.js

// Import necessary modules
import express from 'express'; // Express framework for building web applications
import cors from 'cors';       // CORS middleware to allow cross-origin requests
import dotenv from 'dotenv';   // Dotenv to load environment variables from .env file

// Load environment variables from the .env file at the project root
// This makes variables like PORT and FIREBASE_PROJECT_ID available via process.env
dotenv.config({ path: '../.env' }); // Specify path to the root .env file

// Create an Express application instance
const app = express();

// --- Middleware Setup ---

// Enable CORS for all routes
// This allows your React frontend (running on a different port) to make requests to this server.
app.use(cors());

// Parse incoming JSON request bodies
// This middleware makes JSON data sent in requests (e.g., from your frontend) available on `req.body`.
app.use(express.json());

// --- Routes ---

// Basic test route for the root URL of the API
// This is just to confirm the server is running and accessible.
app.get('/api', (req, res) => {
  res.status(200).json({ message: 'Welcome to the StudentOS API!' });
});

// TODO: Import and use other route files here as we build them out
// Example:
// import authRoutes from './routes/authRoutes.js';
// import academicRoutes from './routes/academicRoutes.js';
// app.use('/api/auth', authRoutes);
// app.use('/api/academic', academicRoutes);

// Export the configured Express app
// This allows server.js to import and use this app instance.
export default app;
