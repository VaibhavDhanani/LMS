import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { configDotenv } from 'dotenv';
import { initMediasoupWorker, registerMediasoupHandlers } from './src/mediasoup/index.js'; 

configDotenv();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
const publicIp = process.env.PUBLIC_IP;
const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});


const rooms = new Map(); // roomId -> { producers: Set, consumers: Set }

await initMediasoupWorker(publicIp);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('createRoom', ({ roomId }, callback) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        host : socket.id,
        producers: new Set(),
        consumers: new Map(),
      });
      socket.join(roomId);
      callback({ success: true });
      console.log(`Room created: ${roomId}`);
    } else {
      const room = rooms.get(roomId);
      room.host = socket.id; 
      socket.join(roomId);
      callback({ success: true });
      console.log(`Room already exists: ${roomId}`);
    }
  });

  socket.on('joinLecture', ({ roomId, userInfo }, callback) => {
    if (!rooms.has(roomId)) return callback({ error: 'Room not found' });

    const room = rooms.get(roomId);

    // Ensure Map exists
    if (!room.consumers) room.consumers = new Map();

    room.consumers.set(socket.id, {
      ...userInfo,
      socketId: socket.id,
    });

    socket.join(roomId);
    console.log(`User ${userInfo.email} joined room: ${roomId}`);

    socket.to(roomId).emit('userJoined', {
      user: { ...userInfo, socketId: socket.id }
    });

    // Notify all users about new participant list
    io.to(roomId).emit('updateParticipantList', {
      participants: [...room.consumers.values()],
    });

    callback({
      producers: [...room.producers],
      consumers: [...room.consumers.values()],
    });
  });


  socket.on('endLecture', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      io.to(roomId).emit('lectureEnded', { message: 'Lecture has ended' });
      rooms.delete(roomId);
      console.log(`Room ${roomId} ended and deleted`);
    }
  });

  socket.on('sendChatMessage', (data, callback) => {
    const { roomId, senderId, senderName, message, timestamp, isHost } = data;
    if (!roomId || !message) return callback({ error: 'Invalid message data' });

    socket.to(roomId).emit('chatMessage', {
      senderId,
      senderName,
      message,
      timestamp,
      isHost,
    });

    callback({ success: true });
  });

  socket.on('typing', ({ roomId, userId, isTyping }) => {
    socket.to(roomId).emit('userTyping', { userId, isTyping });
  });

  registerMediasoupHandlers(io, socket, rooms);
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});