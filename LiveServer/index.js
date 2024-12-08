const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mediasoup = require("mediasoup");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your React app's URL
    methods: ["GET", "POST"],
  },
});

const PORT = 3000;

let worker;
let router;
const producerTransports = new Map();
const consumerTransports = new Map();
const producers = new Map();
const consumers = new Map();

(async () => {
  // Create Mediasoup Worker
  worker = await mediasoup.createWorker();
  console.log("Mediasoup Worker created.");

  // Create Router
  router = await worker.createRouter({
    mediaCodecs: [
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
        parameters: { "x-google-start-bitrate": 1000 },
      },
    ],
  });
  console.log("Router created.");
})();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("get-rtp-capabilities", (callback) => {
    callback(router.rtpCapabilities);
  });

  socket.on("create-producer-transport", async (callback) => {
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0" }], // Replace with your public IP
      enableUdp: true,
      enableTcp: true,
    });

    producerTransports.set(socket.id, transport);
    console.log(`Producer transport created for ${socket.id}`);

    callback({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    });
  });
  
  
  
  socket.on("create-consumer-transport", async (callback) => {
    const transport = await router.createWebRtcTransport({
      listenIps: [{ ip: "0.0.0.0" }],
      enableUdp: true,
      enableTcp: true,
    });

    consumerTransports.set(socket.id, transport);
    console.log(`Consumer transport created for ${socket.id}`);

    callback({
      id: transport.id,
      iceParameters: transport.iceParameters,
      iceCandidates: transport.iceCandidates,
      dtlsParameters: transport.dtlsParameters,
    });
  });

  socket.on("connect-transport", async ({ dtlsParameters }, callback) => {
    const transport =
      producerTransports.get(socket.id) || consumerTransports.get(socket.id);
      console.log("Connecting transport:", transport.id);
      
      await transport.connect({ dtlsParameters });
    callback({ status: "connected" });
  });

  socket.on("produce", async ({ kind, rtpParameters }, callback) => {
    const transport = producerTransports.get(socket.id);
    const producer = await transport.produce({ kind, rtpParameters });
    producers.set(socket.id, producer);

    socket.broadcast.emit("new-producer", { producerId: producer.id, kind });
    callback({ id: producer.id });
  });

  socket.on("consume", async ({ producerId, rtpCapabilities }, callback) => {
    if (!router.canConsume({ producerId, rtpCapabilities })) {
      callback({ error: "Cannot consume" });
      return;
    }

    const transport = consumerTransports.get(socket.id);
    const consumer = await transport.consume({
      producerId,
      rtpCapabilities,
    });

    consumers.set(socket.id, consumer);

    callback({
      id: consumer.id,
      producerId,
      kind: consumer.kind,
      rtpParameters: consumer.rtpParameters,
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
