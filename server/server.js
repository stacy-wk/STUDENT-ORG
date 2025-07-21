// server/server.js

// Import the configured Express app from app.js
import app from './app.js';
// Import Node.js's built-in http module to create an HTTP server
import http from 'http';
// Import Socket.io for real-time communication
import { Server } from 'socket.io';

// Get the port from environment variables, default to 5000 if not set
const PORT = process.env.PORT || 5000;

// Create an HTTP server using the Express app
// This server will handle both regular HTTP requests and Socket.io connections.
const server = http.createServer(app);

// Initialize Socket.io server
// `cors` options here are crucial to allow your frontend to connect to the Socket.io server.
const io = new Server(server, {
  cors: {
    origin: process.env.VITE_API_BASE_URL ? process.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5173', // Adjust origin to match your client's URL
    methods: ['GET', 'POST'], // Allowed HTTP methods for CORS
  },
});

// --- Socket.io Event Handling ---

// Listen for new Socket.io connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Example: Listen for a 'testMessage' event from the client
  socket.on('testMessage', (data) => {
    console.log(`Received test message from ${socket.id}: ${data}`);
    // Emit a 'testResponse' back to the client that sent the message
    socket.emit('testResponse', `Server received: ${data}`);
    // You could also broadcast to all connected clients: io.emit('someEvent', data);
  });

  // Listen for disconnect event
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // TODO: Add more specific Socket.io event listeners here for chat rooms, notifications, etc.
  // Example for chat:
  // socket.on('joinGroup', (groupId) => { ... });
  // socket.on('sendMessage', (messageData) => { ... });
});

// --- Start the Server ---

// Make the HTTP server listen for incoming requests on the specified port
server.listen(PORT, () => {
  console.log(`StudentOS Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
