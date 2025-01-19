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
const producers = new Map(); // Store producers by ID
const consumers = new Map(); // Store consumers by ID
const rooms = new Map(); // Map room IDs to an array of producers

function createRoomIfNotExists(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
}

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

  socket.on('joinLecture', ({ roomId }, callback) => {
    const room = rooms.get(roomId);

    if (!room) {
      return callback({ error: 'Room does not exist' });
    }

    console.log(`Consumer joined room ${roomId}`);
    callback([...room]); // Send the list of producer IDs
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
        listenIps: [{ ip: '127.0.0.1', announcedIp: null }],
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
      createRoomIfNotExists(roomId);

      console.log(`Producing ${kind} for client: ${socket.id} on transport: ${transportId}`);

      const transport = mediasoupTransports.get(transportId);
      if (!transport) throw new Error('Transport not found');

      const producer = await transport.produce({ kind, rtpParameters });

      // Create a new object containing only the desired properties
      const producerInfo = {
        id: producer.id,
        kind: producer.kind,
        rtpParameters: producer.rtpParameters,
      };
      // console.log(producerInfo);
      // Add the simplified producer object to the room
      rooms.get(roomId).add(producerInfo);

      console.log(`Producer ${producer.id} added to room ${roomId}`);

      // Handle producer close
      producer.on('close', () => {
        console.log(`Producer closed: ${producer.id}`);
        producers.delete(producer.id);
        // Remove from room
        const producerRoom = rooms.get(roomId);
        if (producerRoom) {
          rooms.set(roomId, producerRoom.filter(id => id !== producer.id));
        }
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

      const consumers = [];  // Array to hold the consumers

      // Iterate over all producers in the room
      for (const producer of room) {
        try {
          // Create consumer for each producer in the room
          console.log('Creating consumer for ' + producer.id );
          const consumer = await transport.consume({
            producerId: producer.id,
            rtpCapabilities,
            paused: false,  // Start consumer as unpaused
          });

          console.log(`Consumer created: ${consumer}`);

          // Handle consumer closure and clean up
          consumer.on('close', () => {
            console.log(`Consumer closed: ${consumer.id}`);
            // Remove consumer from any data structure or perform cleanup as needed
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
          // consumers.push(consumer);
        } catch (error) {
          console.error('Error creating consumer for producer:', error);
        }
      }

      // Send the list of consumers to the client
      callback(consumers);

    } catch (error) {
      console.error('Error in consume process:', {
        error: error.message,
        stack: error.stack,
      });
      callback({ error: error.message });
    }
  });


  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    // Clean up resources associated with the client
    for (const [transportId, transport] of mediasoupTransports.entries()) {
      if (transport._data && transport._data.socketId === socket.id) {
        console.log(`Cleaning up transport: ${transportId}`);
        transport.close();
      }
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));