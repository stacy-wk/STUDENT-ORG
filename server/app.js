import express from 'express'; 
import cors from 'cors';       
import dotenv from 'dotenv';  
import { db } from './config/firebaseAdmin.js';
import apiRoutes from './routes/index.js';


dotenv.config({ path: '../.env' }); 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());


// Routes

// Basic test route for the root URL of the API
app.get('/api', (req, res) => {
  if (db) {
    res.status(200).json({ message: 'Welcome to the StudentOS API!', firebaseInitialized: true });
  } else {
    res.status(500).json({ message: 'Welcome to the StudentOS API!', firebaseInitialized: false, error: 'Firestore not initialized' });
  }
});

// Mount the main API router
// All routes defined in apiRoutes (e.g., /auth/profile) will be prefixed with '/api'
app.use('/api', apiRoutes);

// TODO
// import authRoutes from './routes/authRoutes.js';
// import academicRoutes from './routes/academicRoutes.js';
// app.use('/api/auth', authRoutes);
// app.use('/api/academic', academicRoutes);

// Export the configured Express app
export default app;
