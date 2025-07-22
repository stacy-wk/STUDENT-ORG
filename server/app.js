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
app.get('/api', (req, res) => {
  if (db) {
    res.status(200).json({ message: 'Welcome to the StudentOS API!', firebaseInitialized: true });
  } else {
    res.status(500).json({ message: 'Welcome to the StudentOS API!', firebaseInitialized: false, error: 'Firestore not initialized' });
  }
});


app.use('/api', apiRoutes);

export default app;
