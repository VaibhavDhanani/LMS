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

let worker;
let router;
let producerTransports = new Map(); // Store producer transports for each lecture
let consumers = new Map();

// Initialize Mediasoup worker
async function createWorker() {
  worker = await mediasoup.createWorker({
    logLevel: 'warn',
    logTags: ['info', 'ice', 'dtls', 'rtp'],
  });

  router = await worker.createRouter({
    mediaCodecs: [
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
      },
      {
        kind: 'audio',
        mimeType: 'audio/OPUS',
        clockRate: 48000,
        channels: 2,
      },
    ],
  });
}

createWorker();
app.get('/routerRtpCapabilities', (req, res) => {""
  if (!router) {
    res.status(500).json({ error: 'Router not initialized' });
    return;
  }

  res.json(router.rtpCapabilities);
});

// WebSocket for socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('create-lecture', async (lectureDetails) => {
    const lectureId = generateUniqueLectureId();
    console.log('New lecture created: ' + lectureDetails.title);

    // Create a new transport for the host
    const producerTransport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0' }], // Listen on all interfaces
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });

    // Store the transport for this lecture
    producerTransports.set(lectureId, producerTransport);

    // Send the transport information to the host
    socket.emit('lecture-created', {
      lectureId: lectureId,
      transportOptions: producerTransport.options,
    });

    // Join the socket to the lecture room
    socket.join(lectureId);
  });

  socket.on('offer', async (offer) => {
    const lectureId = Array.from(socket.rooms)[1]; // Get the lecture ID from the socket's rooms
    const producerTransport = producerTransports.get(lectureId);
  
    if (!producerTransport) {
      console.error('Producer transport not found for lecture ID:', lectureId);
      return;
    }
  
    // Create a new consumer transport for the participant
    const consumerTransport = await router.createWebRtcTransport({
      listenIps: [{ ip: '0.0.0.0', announcedIp: 'your.server.ip' }],
      enableUdp: true,
      enableTcp: true,
      preferUdp: true,
    });
  
    // Send transport options to the host
    socket.emit('transport-options', consumerTransport.options);
  
    // Set up the peer connection
    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.l.twilio.com:3478",
          ],
        },
      ],
    });
  
    // Set the remote description
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
  
    // Create an answer
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
  
    // Send the answer back to the client
    socket.emit('answer', answer);
  
    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate);
      }
    };
  
    // Store the consumer transport for later use
    socket.consumerTransport = consumerTransport;
  });

  // Handle producer stream
  socket.on('send-producer-stream', async (producerStream) => {
    const lectureId = Array.from(socket.rooms)[1]; // Get the lecture ID from the socket's rooms
    const producerTransport = producerTransports.get(lectureId);

    if (!producerTransport) {
      console.error('Producer transport not found for lecture ID:', lectureId);
      return;
    }

    // Create a producer using the transport and the RTP parameters from the stream
    const producer = await producerTransport.produce({
      kind: producerStream.kind, // 'video' or 'audio'
      rtpParameters: producerStream.rtpParameters, // RTP parameters should be sent from the client
    });

    console.log("Producer created with ID:", producer.id);

    // Notify other participants of the new producer
    socket.to(lectureId).emit('new-producer', { producerId: producer.id });
  });

  // Handle other events like ICE candidates, etc.
});

  // socket.on('join-lecture', async (lectureId) => {
  //   const producerTransport = producerTransports.get(lectureId);
  //   if (!producerTransport) {
  //     return socket.emit('join-lecture-error', { message: 'Lecture not found' });
  //   }

  //   // Create a new transport for participants
  //   const consumerTransport = await router.createWebRtcTransport({
  //     listenIps: [{ ip: '0.0.0.0', announcedIp: 'your.server.ip' }],
  //     enableUdp: true,
  //     enableTcp: true,
  //     preferUdp: true,
  //   });

  //   // Send transport options to the participant
  //   socket.emit('transport-options', consumerTransport.options);

  //   // Create consumer for the participant
  //   for (let producer of producerTransport.producers.values()) {
  //     const consumer = await consumerTransport.consume({
  //       producerId: producer.id,
  //       rtpCapabilities: router.rtpCapabilities,
  //     });

  //     // Send consumer information to participant
  //     socket.emit('new-consumer', {
  //       consumerOptions: consumer.options,
  //       producerId: producer.id, // Send producer ID for reference
  //     });
  //   }

  //   // Store the consumer transport for later use
  //   socket.consumerTransport = consumerTransport;
  // });


//   socket.on('disconnect', () => {
//     // Clean up on disconnect
//     if (socket.consumerTransport) {
//       socket.consumerTransport.close();
//     }
//   });
// });

// Utility function to generate unique lecture ID
function generateUniqueLectureId() {
  return `lecture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Start the server
const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});