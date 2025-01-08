const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mediasoup = require("mediasoup");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
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
      announcedIp: "172.20.10.6", 
    },
  ],
  enableUdp: true,
  enableTcp: true,
  preferUdp: true,
};

io.on("connection", async (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("get-rtp-capabilities", (callback) => {
    console.log("RTP Capabilities requested by client:", socket.id);
    if (!router) {
      callback({ error: "Router not ready" });
      console.error("Router not ready for RTP Capabilities");
      return;
    }
    callback(router.rtpCapabilities);
    console.log("Sent RTP Capabilities to client:", socket.id);
  });

  socket.on("create-producer-transport", async (callback) => {
    console.log("Create Producer Transport requested by client:", socket.id);
    try {
      const transport = await router.createWebRtcTransport(webRtcTransportOptions);
      producerTransports.set(socket.id, transport);

      console.log("Producer Transport created:", {
        id: transport.id,
        socketId: socket.id,
      });

      transport.on('dtlsstatechange', (dtlsState) => {
        console.log("Producer Transport DTLS state changed:", dtlsState);
        if (dtlsState === 'closed') {
          transport.close();
          producerTransports.delete(socket.id);
          console.log("Producer Transport closed for client:", socket.id);
        }
      });

      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    } catch (error) {
      console.error("Error creating Producer Transport for client:", socket.id, error);
      callback({ error: error.message });
    }
  });

  socket.on("create-consumer-transport", async (callback) => {
    console.log("Create Consumer Transport requested by client:", socket.id);
    try {
      const transport = await router.createWebRtcTransport(webRtcTransportOptions);
      consumerTransports.set(socket.id, transport);

      console.log("Consumer Transport created:", {
        id: transport.id,
        socketId: socket.id,
      });

      transport.on('dtlsstatechange', (dtlsState) => {
        console.log("Consumer Transport DTLS state changed:", dtlsState);
        if (dtlsState === 'closed') {
          transport.close();
          consumerTransports.delete(socket.id);
          console.log("Consumer Transport closed for client:", socket.id);
        }
      });

      callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
    } catch (error) {
      console.error("Error creating Consumer Transport for client:", socket.id, error);
      callback({ error: error.message });
    }
  });

  socket.on("connect-transport", async ({ dtlsParameters }, callback) => {
    console.log("Connect Transport requested by client:", socket.id);
    try {
      const transport = producerTransports.get(socket.id) || consumerTransports.get(socket.id);
      if (!transport) {
        throw new Error('Transport not found');
      }

      await transport.connect({ dtlsParameters });
      console.log("Transport connected successfully for client:", socket.id);
      callback({ success: true });
    } catch (error) {
      console.error("Error connecting Transport for client:", socket.id, error);
      callback({ error: error.message });
    }
  });

  socket.on("produce", async ({ kind, rtpParameters }, callback) => {
    console.log("Produce requested by client:", socket.id, "Kind:", kind);
    try {
      const transport = producerTransports.get(socket.id);
      if (!transport) {
        throw new Error('Producer transport not found');
      }

      const producer = await transport.produce({ kind, rtpParameters });
      producers.set(producer.id, producer);

      console.log("Producer created:", {
        producerId: producer.id,
        kind: producer.kind,
        socketId: socket.id,
      });

      producer.on('transportclose', () => {
        producer.close();
        producers.delete(producer.id);
        console.log("Producer closed:", producer.id);
      });

      socket.broadcast.emit("new-producer", {
        producerId: producer.id,
        kind: producer.kind,
      });

      callback({ id: producer.id });
    } catch (error) {
      console.error("Error producing for client:", socket.id, error);
      callback({ error: error.message });
    }
  });

  socket.on("consume", async ({ producerId, rtpCapabilities }, callback) => {
    console.log("Consume requested by client:", socket.id, "Producer ID:", producerId);
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
        paused: true,
      });

      consumers.set(consumer.id, consumer);

      console.log("Consumer created:", {
        consumerId: consumer.id,
        kind: consumer.kind,
        producerId: consumer.producerId,
        socketId: socket.id,
      });

      consumer.on('transportclose', () => {
        consumer.close();
        consumers.delete(consumer.id);
        console.log("Consumer closed:", consumer.id);
      });

      callback({
        id: consumer.id,
        producerId: consumer.producerId,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        producerPaused: consumer.producerPaused,
      });

      await consumer.resume();
      console.log("Consumer resumed for client:", socket.id);
    } catch (error) {
      console.error("Error consuming for client:", socket.id, error);
      callback({ error: error.message });
    }
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