import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Device } from 'mediasoup-client';


const socket = io('http://localhost:8000');
const device = new Device();

function LectureRoom() {
  const [peerConnection, setPeerConnection] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const videoRef = useRef(null); // Reference for the host's video element

  const createLecture = async () => {
    try {
      socket.emit('create-lecture', {
        title: 'Demo Lecture',
        subject: 'Introduction to WebRTC',
      });

      setIsHost(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = stream;
    } catch (error) {
      console.error('Error creating lecture:', error);
    }
  };

socket.on('lecture-created', async (data) => {
  console.log('Lecture created:', data.lectureId);

  // Load the device with the server's RTP capabilities
  await device.load({ routerRtpCapabilities: data.rtpCapabilities });

  // Request transport creation for producing media
  socket.emit('create-producer-transport', {}, async (transportOptions) => {
    console.log('Producer transport options:', transportOptions);

    // Create a send transport using the provided transport options
    const producerTransport = device.createSendTransport(transportOptions);

    // Add listeners for transport events
// Inside the transport connect handler
producerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
  try {
    if (producerTransport.connected) {
      console.log('Transport already connected, skipping connection process.');
      return callback(); // If already connected, just acknowledge
    }

    console.log('Connecting transport...');
    socket.emit('connect-transport', {
      transportId: producerTransport.id,
      dtlsParameters,
    }, () => {});

    socket.on('transport-connected', (data) => {
      if (data.transportId === producerTransport.id) {
        producerTransport.connected = true;  // Mark as connected
        console.log('Producer transport connected.');
        callback(); // Acknowledge the connection after successful connection
      } else {
        console.log('Transport connection failed.');
        errback(new Error('Transport connection failed'));
      }
    });
  } catch (error) {
    console.error('Error during transport connect:', error);
    errback(error); // Handle errors
  }
});
    // Handle disconnect event (for cleanup)
    producerTransport.on('disconnect', ({ appData }, callback) => {
      console.log('Producer transport disconnected.');
      callback();
    });

    // Handle produce event
    producerTransport.on('produce', async ({ track }) => {
      try {
        console.log("producing");

        // Add each track to the transport once connected
        // await producerTransport.produce({ track });
        console.log('Track produced and sent.');
      } catch (error) {
        console.error('Error during track production:', error);
      }
    });

    // Get user media (audio/video)
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    // Produce each track from the stream
    stream.getTracks().forEach((track) => {
      // Ensure the transport is ready before producing the track
      producerTransport.produce({ track });
    });

  });
});



  return (
    <div>
      <h1>Lecture Room</h1>
      <button onClick={createLecture}>Create Lecture</button>
      <video ref={videoRef} autoPlay muted /> {/* Host's video stream */}
      <video id="remoteVideo" autoPlay /> {/* Remote user's video stream */}
    </div>
  );
}

export default LectureRoom;