const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables from .env file
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



// Lecture rooms management
const lectureRooms = new Map();

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('create-lecture', (lectureDetails) => {
    const lectureId = generateUniqueLectureId();
    
    // Store lecture details
    lectureRooms.set(lectureId, {
      host: socket.id,
      participants: new Set([socket.id]),
      details: lectureDetails,
      createdAt: new Date()
    });

    // Join the room
    socket.join(lectureId);

    // Respond with lecture ID
    socket.emit('lecture-created', {
      lectureId: lectureId,
      message: 'Lecture room created successfully'
    });
  });

  // Join lecture room
  socket.on('join-lecture', (lectureId) => {
    const lectureRoom = lectureRooms.get(lectureId);

    if (lectureRoom) {
      // Add participant to the room
      lectureRoom.participants.add(socket.id);
      socket.join(lectureId);

      // Notify host about new participant
      socket.to(lectureRoom.host).emit('participant-joined', {
        participantId: socket.id,
        totalParticipants: lectureRoom.participants.size
      });

      // Confirm joining to the participant
      socket.emit('join-lecture-success', {
        lectureId: lectureId,
        message: 'Successfully joined the lecture',
        totalParticipants: lectureRoom.participants.size
      });
    } else {
      // Lecture not found
      socket.emit('join-lecture-error', {
        message: 'Lecture room not found'
      });
    }
  });

  // Leave lecture room
  socket.on('leave-lecture', (lectureId) => {
    const lectureRoom = lectureRooms.get(lectureId);

    if (lectureRoom) {
      lectureRoom.participants.delete(socket.id);
      socket.leave(lectureId);

      // Notify host about participant leaving
      socket.to(lectureRoom.host).emit('participant-left', {
        participantId: socket.id,
        totalParticipants: lectureRoom.participants.size
      });

      // If no participants left, remove the lecture room
      if (lectureRoom.participants.size === 0) {
        lectureRooms.delete(lectureId);
      }
    }
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    // Find and remove socket from any lecture rooms
    for (const [lectureId, lectureRoom] of lectureRooms.entries()) {
      if (lectureRoom.participants.has(socket.id)) {
        lectureRoom.participants.delete(socket.id);

        // Notify host about participant leaving
        socket.to(lectureRoom.host).emit('participant-left', {
          participantId: socket.id,
          totalParticipants: lectureRoom.participants.size
        });

        // Remove lecture if no participants
        if (lectureRoom.participants.size === 0) {
          lectureRooms.delete(lectureId);
        }
      }
    }
  });
});

// Utility function to generate unique lecture ID
function generateUniqueLectureId() {
  return `lecture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Start server
const PORT = process.env.PORT || 8001;
server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
});