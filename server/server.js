import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from './config/firebaseAdmin.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const serviceAccountPath = path.resolve(__dirname, 'config', 'serviceAccountKey.json');
// let serviceAccount;
// try {
//   serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
// } catch (error) {
//   console.error('Error loading Firebase service account key:', error.message);
//   console.error(`Please ensure ${path.basename(serviceAccountPath)} is in the server/config directory and is valid JSON.`);
//   process.exit(1);
// }

import apiRoutes from './routes/index.js';
import { authenticateToken } from './middleware/authMiddleware.js';

import http from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { saveMessage } from './controllers/chatController.js';


dotenv.config();

// Firebase Admin SDK only if it hasn't been initialized
// if (!admin.apps.length) { 
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });
//   console.log('Firebase Admin SDK initialized with service account.');
// } else {
//   console.log('Firebase Admin SDK already initialized.');
// }


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
  req.firebaseAdmin = admin;
  next();
});

app.use('/api', authenticateToken, apiRoutes);


const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] User connected: ${socket.id}`);

  socket.on('joinRoom', (roomId, userId) => {
    socket.join(roomId);
    console.log(`[Socket.IO] User ${userId} (${socket.id}) joined room: ${roomId}`);
  });

  socket.on('sendMessage', async ({ roomId, senderId, senderName, messageText }) => {
    console.log(`[Socket.IO] Message received for room ${roomId} from ${senderName} (${senderId}): ${messageText}`);

    if (!roomId || !senderId || !senderName || !messageText) {
      console.error('[Socket.IO] Invalid message data received.');
      return;
    }

    try {
      const newMessage = await saveMessage(roomId, senderId, senderName, messageText);
      console.log('[Socket.IO] Message saved to Firestore:', newMessage.id);

      io.to(roomId).emit('message', newMessage);
    } catch (error) {
      console.error('[Socket.IO] Error saving or emitting message:', error);
      socket.emit('messageError', { message: 'Failed to send message.', error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] User disconnected: ${socket.id}`);
  });
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Client URL: ${process.env.CLIENT_URL}`);
});
