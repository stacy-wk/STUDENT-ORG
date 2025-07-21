import express from 'express'; 
import cors from 'cors';       
import dotenv from 'dotenv';  
import { db } from './config/firebaseAdmin.js';


dotenv.config({ path: '../.env' }); 

const app = express();

// Middlewares

// CORS for all routes
app.use(cors());

// Parse incoming JSON request bodies
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

// TODO
// import authRoutes from './routes/authRoutes.js';
// import academicRoutes from './routes/academicRoutes.js';
// app.use('/api/auth', authRoutes);
// app.use('/api/academic', academicRoutes);

// Export the configured Express app
export default app;
