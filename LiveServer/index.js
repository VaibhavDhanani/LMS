const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { createWorker } = require('mediasoup');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Replace with your frontend's URL for production
    methods: ['GET', 'POST'],
  },
});

let router; // Mediasoup router
const mediasoupTransports = new Map(); // Store transports by ID
const rooms = new Map(); // Map room IDs to an array of producers

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
        listenIps: [{ ip: '0.0.0.0', announcedIp: '172.20.10.6' }],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
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
  
  

  socket.on('consume', async ({ roomId, transportId, rtpCapabilities }, callback) => {
    try {
      // Retrieve transport object for the consumer
      const transport = mediasoupTransports.get(transportId);
      if (!transport) {
        console.error(`Transport not found: ${transportId}`);
        return callback({ error: 'Transport not found' });
      }
  
      // Retrieve the room object
      const room = rooms.get(roomId);
      if (!room) {
        return callback({ error: 'Room does not exist' });
      }
  
      const consumers = []; // Array to hold the consumers
  
      // ✅ Correct way to retrieve producers
      for (const producer of room.producers) {  
        try {
          console.log('Creating consumer for producer:', producer.id);
          const consumer = await transport.consume({
            producerId: producer.id,
            rtpCapabilities,
            paused: false, // Start consumer as unpaused
          });
  
          console.log(`Consumer created: ${consumer.id}`);
  
          // Handle consumer closure and clean up
          consumer.on('close', () => {
            console.log(`Consumer closed: ${consumer.id}`);
          });
  
          // If necessary, resume the consumer (though `paused: false` should make this unnecessary)
          await consumer.resume();
  
          // Add consumer details to the consumers array
          consumers.push({
            producerId: producer.id,
            id: consumer.id,
            kind: consumer.kind,
            rtpParameters: consumer.rtpParameters,
          });
  
        } catch (error) {
          console.error(`Error creating consumer for producer ${producer.id}:`, error);
        }
      }
  
      // Send the list of consumers to the client
      callback(consumers);
  
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
      // if (room.producers.size === 0 && room.consumers.size === 0) {
      //   rooms.delete(roomId);
      //   console.log(`Room ${roomId} deleted as it's now empty`);
      // }
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

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));