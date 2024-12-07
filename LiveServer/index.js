const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mediasoup = require('mediasoup');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Replace with your React app's URL
    methods: ["GET", "POST"],
  },
});

let worker, router, producerTransport, consumerTransport;
let producerTransports = new Map(); // Store producer transports for each lecture

const peerConnections = {};

// Initialize Mediasoup worker
async function createMediasoupWorker() {
  // Create a Mediasoup Worker
  worker = await mediasoup.createWorker();

  worker.on('died', () => {
    console.error('Mediasoup worker has died');
    process.exit(1);
  });

  router = await worker.createRouter({ mediaCodecs: [
    { kind: 'audio', mimeType: 'audio/opus', clockRate: 48000, channels: 2 },
    { kind: 'video', mimeType: 'video/VP8', clockRate: 90000 }
  ]});
}
// WebSocket for socket.io connection
io.on('connection', socket => {
  console.log('New client connected:', socket.id);
  socket.on('create-lecture', async (lectureDetails) => {
    // Generate a unique lecture ID
    const lectureId = generateUniqueLectureId();
    console.log('New lecture created: ' + lectureDetails.title);
  
    // Generate the RTP capabilities for the lecture room (Mediasoup Router)
    const rtpCapabilities = router.rtpCapabilities;
  
    // Send the transport information along with RTP capabilities to the host
    socket.emit('lecture-created', {
      lectureId: lectureId,
      rtpCapabilities: rtpCapabilities, // Include RTP capabilities
    });
  
    // Join the socket to the lecture room
    socket.join(lectureId);
  });
    
  socket.on('create-producer-transport', async (data,callback) => {
      const transport = await router.createWebRtcTransport({
        listenIps: [{ ip: '127.0.0.1', announcedIp: null }],
        enableUdp: true,
        enableTcp: true,
        preferUdp: true,
      });

      producerTransports.set(socket.id, transport);
      await callback({
        id: transport.id,
        iceParameters: transport.iceParameters,
        iceCandidates: transport.iceCandidates,
        dtlsParameters: transport.dtlsParameters,
      });
  });
  
  socket.on('connect-transport', async ({ transportId, dtlsParameters },callback) => {
    const transport = producerTransports.get(socket.id);
    if (transport && !transport.connected) {
      await transport.connect({ dtlsParameters }).then(() => {
        // Emit transport-connected only after a successful connection
        socket.emit('transport-connected', { transportId });
      }
      )
    }
  });
  
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    if (peerConnections[socket.id]) {
      // Clean up peer connections
      peerConnections[socket.id].close();
      delete peerConnections[socket.id];
    }
  });
});


// Utility function to generate unique lecture ID
function generateUniqueLectureId() {
  return `lecture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Start the server
const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});
createMediasoupWorker().then(() => {
  console.log('Mediasoup worker created and ready.');
});