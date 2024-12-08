const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mediasoup = require("mediasoup");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = 3000;

let worker;
let router;
const rooms = new Map(); // Store room state
const producerTransports = new Map();
const consumerTransports = new Map();
const producers = new Map();
const consumers = new Map();

// MediaSoup options
const mediaCodecs = [
  {
    kind: "audio",
    mimeType: "audio/opus",
    clockRate: 48000,
    channels: 2,
  },
  {
    kind: "video",
    mimeType: "video/VP8",
    clockRate: 90000,
    parameters: {
      "x-google-start-bitrate": 1000,
    },
  },
];

(async () => {
  worker = await mediasoup.createWorker({
    logLevel: 'debug',
    logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp'],
  });
  console.log("Mediasoup Worker created");

  router = await worker.createRouter({ mediaCodecs });
  console.log("Router created");

  // Handle worker shutdown
  worker.on('died', () => {
    console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
    setTimeout(() => process.exit(1), 2000);
  });
})();

// WebRTC transport options
const webRtcTransportOptions = {
  listenIps: [
    {
      ip: "0.0.0.0",
      announcedIp: "127.0.0.1", // Replace with your public IP in production
    },
  ],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
};

io.on("connection", async (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("get-rtp-capabilities", (callback) => {
    if (!router) {
      callback({ error: "Router not ready" });
      return;
    }
    callback(router.rtpCapabilities);
  });

  socket.on("create-producer-transport", async (callback) => {
    try {
      const transport = await router.createWebRtcTransport(webRtcTransportOptions);
      
      // Store transport
      producerTransports.set(socket.id, transport);
      
      // Handle transport closure
      transport.on('dtlsstatechange', dtlsState => {
        if (dtlsState === 'closed') {
          transport.close();
          producerTransports.delete(socket.id);
        }
      });

      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    } catch (error) {
      console.error('Failed to create producer transport:', error);
      callback({ error: error.message });
    }
  });

  socket.on("create-consumer-transport", async (callback) => {
    try {
      const transport = await router.createWebRtcTransport(webRtcTransportOptions);
      
      // Store transport
      consumerTransports.set(socket.id, transport);
      
      // Handle transport closure
      transport.on('dtlsstatechange', dtlsState => {
        if (dtlsState === 'closed') {
          transport.close();
          consumerTransports.delete(socket.id);
        }
      });

      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    } catch (error) {
      console.error('Failed to create consumer transport:', error);
      callback({ error: error.message });
    }
  });

  socket.on("connect-transport", async ({ dtlsParameters }, callback) => {
    try {
      const transport = producerTransports.get(socket.id) || consumerTransports.get(socket.id);
      if (!transport) {
        throw new Error('Transport not found');
      }

      await transport.connect({ dtlsParameters });
      callback({ success: true });
    } catch (error) {
      console.error('Failed to connect transport:', error);
      callback({ error: error.message });
    }
  });

  socket.on("produce", async ({ kind, rtpParameters }, callback) => {
    try {
      const transport = producerTransports.get(socket.id);
      if (!transport) {
        throw new Error('Producer transport not found');
      }

      const producer = await transport.produce({ kind, rtpParameters });
      producers.set(producer.id, producer);

      // Handle producer closure
      producer.on('transportclose', () => {
        producer.close();
        producers.delete(producer.id);
        // Notify all consumers about producer removal
        socket.broadcast.emit('producer-closed', { producerId: producer.id });
      });

      // Notify all clients about new producer
      socket.broadcast.emit("new-producer", {
        producerId: producer.id,
        kind: producer.kind
      });

      callback({ id: producer.id });
    } catch (error) {
      console.error('Failed to produce:', error);
      callback({ error: error.message });
    }
  });

  socket.on("consume", async ({ producerId, rtpCapabilities }, callback) => {
    try {
      if (!router.canConsume({ producerId, rtpCapabilities })) {
        throw new Error('Cannot consume this producer');
      }

      const transport = consumerTransports.get(socket.id);
      if (!transport) {
        throw new Error('Consumer transport not found');
      }

      const consumer = await transport.consume({
        producerId,
        rtpCapabilities,
        paused: true, // Start paused and resume after handling the callback
      });

      consumers.set(consumer.id, consumer);

      // Handle consumer closure
      consumer.on('transportclose', () => {
        consumer.close();
        consumers.delete(consumer.id);
      });

      callback({
        id: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        producerPaused: consumer.producerPaused
      });

      // Resume the consumer
      await consumer.resume();
    } catch (error) {
      console.error('Failed to consume:', error);
      callback({ error: error.message });
    }
  });

  socket.on("get-producers", (callback) => {
    const producerList = Array.from(producers.values()).map(producer => ({
      producerId: producer.id,
      kind: producer.kind
    }));
    callback(producerList);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    
    // Close and cleanup producer transport
    const producerTransport = producerTransports.get(socket.id);
    if (producerTransport) {
      producerTransport.close();
      producerTransports.delete(socket.id);
    }

    // Close and cleanup consumer transport
    const consumerTransport = consumerTransports.get(socket.id);
    if (consumerTransport) {
      consumerTransport.close();
      consumerTransports.delete(socket.id);
    }

    // Cleanup any producers
    producers.forEach((producer, id) => {
      if (producer.appData.socketId === socket.id) {
        producer.close();
        producers.delete(id);
        // Notify other clients
        socket.broadcast.emit('producer-closed', { producerId: id });
      }
    });

    // Cleanup any consumers
    consumers.forEach((consumer, id) => {
      if (consumer.appData.socketId === socket.id) {
        consumer.close();
        consumers.delete(id);
      }
    });
  });
});

// Error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});