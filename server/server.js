import app from './app.js';
import http from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 5000;

// HTTP server using the Express app
const server = http.createServer(app);

// Initialize Socket.io server
const io = new Server(server, {
  cors: {
    origin: process.env.VITE_API_BASE_URL ? process.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5173', // Adjust origin to match your client's URL
    methods: ['GET', 'POST'], // Allowed HTTP methods for CORS
  },
});


// Socket.io Event Handling

// Listen for new Socket.io connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for a 'testMessage' event from the client
  socket.on('testMessage', (data) => {
    console.log(`Received test message from ${socket.id}: ${data}`);
    socket.emit('testResponse', `Server received: ${data}`);
  });

  // Listen for disconnect event
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });

  // TODO:
  // socket.on('joinGroup', (groupId) => { ... });
  // socket.on('sendMessage', (messageData) => { ... });
});

// Start the Server 
server.listen(PORT, () => {
  console.log(`StudentOS Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
