import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createWorker } from 'mediasoup';
import { configDotenv } from 'dotenv';
configDotenv();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
const publicIp = process.env.PUBLIC_IP;
const app = express();

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Replace with your frontend's URL for production
    methods: ['GET', 'POST'],
  },
});

let router; // Mediasoup router
const mediasoupTransports = new Map(); // Store transports by ID
const rooms = new Map(); // Map room IDs to an array of producers
const consumersMap = new Map(); 
// Initialize Mediasoup worker and router
(async () => {
  const worker = await createWorker();
  router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
      },
    ],
  });
  console.log('Router initialized');
})();

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('createRoom', ({ roomId }, callback) => {
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        producers: new Set(), // Stores producer IDs
        consumers: new Set(), // Stores consumer IDs
      });
      socket.join(roomId);
      console.log(`Room ${roomId} created`);
      callback({ success: true });
    } else {
      callback({ error: 'Room already exists' });
    }
  });
  
  socket.on('joinLecture', ({ roomId }, callback) => {
    if (!rooms.has(roomId)) {
      return callback({ error: 'Room does not exist' });
    }
  
    const room = rooms.get(roomId);
  
    socket.join(roomId); // Add the socket to the room
    room.consumers.add(socket.id); // Add consumer to the room
    console.log(`Consumer ${socket.id} joined room ${roomId}`);
  
    // Notify other users in the room
    socket.to(roomId).emit('userJoined', { userId: socket.id });
  
    // Send producers and consumers separately
    callback({
      producers: [...room.producers], // List of producer objects
      consumers: [...room.consumers], // List of consumer socket IDs
    });
  });

  socket.on('sendChatMessage', (messageData, callback) => {
    try {
      const { roomId, senderId, senderName, message, timestamp, isHost } = messageData;
      
      // Validate the message data
      if (!roomId || !message) {
        return callback({ error: 'Invalid message data' });
      }

      // Add any server-side validation or processing here
      
      // Broadcast the message to all clients in the room except the sender
      socket.to(roomId).emit('chatMessage', {
        senderId,
        senderName,
        message,
        timestamp,
        isHost
      });

      // Acknowledge successful sending
      callback({ success: true });
    } catch (error) {
      console.error('Error handling chat message:', error);
      callback({ error: 'Failed to send message' });
    }
  });
  
  // You can also add events for typing indicators, read receipts, etc.
  socket.on('typing', ({ roomId, userId, isTyping }) => {
    socket.to(roomId).emit('userTyping', { userId, isTyping });
  });

  

  socket.on('getRtpCapabilities', (callback) => {
    if (!router) {
      console.error('Router not initialized');
      return callback({ error: 'Router not initialized' });
    }
    console.log('Sending RTP Capabilities to client:', socket.id);
    callback({ rtpCapabilities: router.rtpCapabilities });
  });

  socket.on('createTransport', async ({ direction }, callback) => {
    try {
      console.log(`Creating ${direction} transport for client: ${socket.id}`);
      const transport = await router.createWebRtcTransport({
        listenIps: [{ ip: '0.0.0.0', announcedIp: publicIp }],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
        // Add TURN server configuration
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] },
          {
            urls: ['turn:your-turn-server.com:3478'],
            username: 'username',
            credential: 'credential'
          }
        ]
      });

      mediasoupTransports.set(transport.id, transport);
      console.log(`Transport created: ${transport.id}`);

      // Handle transport close
      transport.on('close', () => {
        console.log('Transport closed:', transport.id);
        mediasoupTransports.delete(transport.id);
      });

      callback({
        transportParams: {
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
        },
      });
    } catch (error) {
      console.error('Error creating transport:', error);
      callback({ error: error.message });
    }
  });

  socket.on('connectTransport', async ({ transportId, dtlsParameters }, callback) => {
    try {
      console.log(`Connecting transport: ${transportId} for client: ${socket.id}`);
      const transport = mediasoupTransports.get(transportId);
      if (!transport) throw new Error('Transport not found');

      await transport.connect({ dtlsParameters });
      console.log(`Transport connected successfully: ${transportId}`);
      callback({ success: true });
    } catch (error) {
      console.error('Error connecting transport:', error);
      callback({ error: error.message });
    }
  });

  
  
  socket.on('produce', async ({ transportId, kind, rtpParameters, roomId }, callback) => {
    try {
      if (!rooms.has(roomId)) {
        return callback({ error: 'Room does not exist. Please create the room first.' });
      }
  
      console.log(`Producing ${kind} for client: ${socket.id} on transport: ${transportId}`);
  
      const transport = mediasoupTransports.get(transportId);
      if (!transport) throw new Error('Transport not found');
  
      const producer = await transport.produce({ kind, rtpParameters });
  
      const producerInfo = {
        id: producer.id,
        kind: producer.kind,
        rtpParameters: producer.rtpParameters,
        socketId: socket.id, // Track which user created the producer
      };
  
      rooms.get(roomId).producers.add(producerInfo);
      console.log(`Producer ${producer.id} added to room ${roomId}`);
  
      // Notify all consumers in the room about the new producer
      io.to(roomId).emit('newProducer', {producerInfo});
  
      producer.on('close', () => {
        console.log(`Producer closed: ${producer.id}`);
        rooms.get(roomId).producers.delete(producerInfo);
  
        // Notify consumers that the producer is gone
        io.to(roomId).emit('producerClosed', { producerId: producer.id });
      });
  
      callback({ producerId: producer.id, roomId });
    } catch (error) {
      console.error('Error creating producer:', error);
      callback({ error: error.message });
    }
  });
  
  socket.on('consumeProducer', async ({ transportId, producerId, rtpCapabilities }, callback) => {
    try {
      // Retrieve transport object for the consumer
      const transport = mediasoupTransports.get(transportId);
      if (!transport) {
        console.error(`Transport not found: ${transportId}`);
        return callback({ error: 'Transport not found' });
      }
  
      console.log('Creating consumer for producer:', producerId);
      const consumer = await transport.consume({
        producerId: producerId,
        rtpCapabilities,
        paused: false, // Start consumer immediately
      });
  
      console.log(`Consumer created: ${consumer.id}`);
  
      // Store the consumer in a global map
      if (!consumersMap.has(socket.id)) {
        consumersMap.set(socket.id, []);
      }
      consumersMap.get(socket.id).push(consumer);
  
      // Handle consumer closure
      consumer.on('close', () => {
        console.log(`Consumer closed: ${consumer.id}`);
      });
  
      // If necessary, resume the consumer
      await consumer.resume();
  
      // Send consumer details back to client
      callback({
        id: consumer.id,
        producerId: producerId, // Fixed incorrect reference
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
      });
  
    } catch (error) {
      console.error('Error in consume process:', error);
      callback({ error: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  
    // Iterate over all rooms to remove the producer if the socket disconnects
    for (const [roomId, room] of rooms.entries()) {
      const producersToRemove = [];
  
      for (const producer of room.producers) {
        if (producer.socketId === socket.id) {
          producersToRemove.push(producer);
        }
      }
  
      // Remove producers and notify consumers
      for (const producer of producersToRemove) {
        room.producers.delete(producer);
        console.log(`Producer removed: ${producer.id} from room ${roomId}`);
  
        io.to(roomId).emit('producerClosed', { producerId: producer.id });
      }
  
      // Remove consumer references
      room.consumers.delete(socket.id);
  
      // If the room is empty, clean it up
      if (room.producers.size === 0 && room.consumers.size === 0) {
        rooms.delete(roomId);
        console.log(`Room ${roomId} deleted as it's now empty`);
      }
    }
  
    // Cleanup transports
    for (const [transportId, transport] of mediasoupTransports.entries()) {
      if (transport._data && transport._data.socketId === socket.id) {
        console.log(`Cleaning up transport: ${transportId}`);
        transport.close();
        mediasoupTransports.delete(transportId);
      }
    }
  });
  
});

const PORT = process.env.PORT||3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));