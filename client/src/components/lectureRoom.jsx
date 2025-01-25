import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Device } from 'mediasoup-client';

const LectureRoom = () => {
  const [device, setDevice] = useState(null);
  const [transport, setTransport] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [roomId, setRoomId] = useState(''); // Added state for room ID
  const [socket, setSocket] = useState(null); // Store the socket instance in state

  useEffect(() => {
    // Initialize the socket connection
    const newSocket = io('http://172.20.10.6:3000');
    setSocket(newSocket); // Save the socket instance in state

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      setupDevice(newSocket); // Pass the initialized socket
    });

    // Clean up the socket connection on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Function to handle device setup
  async function setupDevice(socket) {
    try {
      if (!socket) {
        console.error('Socket is not initialized');
        return;
      }

      // Request RTP capabilities from the server
      const rtpCapabilities = await new Promise((resolve, reject) => {
        socket.emit('getRtpCapabilities', (response) => {
          if (response.error) {
            reject(response.error);
          } else {
            resolve(response.rtpCapabilities);
          }
        });
      });

      // Initialize the mediasoup device
      const newDevice = new Device();
      await newDevice.load({ routerRtpCapabilities: rtpCapabilities });

      setDevice(newDevice);
      console.log('Device loaded successfully:', newDevice);
    } catch (error) {
      console.error('Error setting up device:', error);
    }
  }

  // Function to start streaming and producing media
  async function startStreaming() {
    if (!roomId) {
      console.error('Room ID is required');
      return;
    }

    if (!socket) {
      console.error('Socket is not initialized');
      return;
    }

    try {
      console.log('Requesting transport creation...');
      const transportParams = await new Promise((resolve, reject) => {
        socket.emit('createTransport', { direction: 'send', roomId }, (response) => {
          if (response.error) {
            console.error('Error creating transport:', response.error);
            reject(response.error);
          } else {
            console.log('Transport created successfully:', response.transportParams);
            resolve(response.transportParams);
          }
        });
      });

      const sendTransport = device.createSendTransport(transportParams);

      // Handle transport connection
      sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        console.log('Connecting transport...');
        try {
          socket.emit('connectTransport', { transportId: sendTransport.id, dtlsParameters }, (response) => {
            if (response.error) {
              console.error('Error during transport connection:', response.error);
              errback(response.error);
            } else {
              console.log('Transport connected successfully:', sendTransport.id);
              callback();
            }
          });
        } catch (error) {
          console.error('Transport connection error:', error);
          errback(error);
        }
      });

      // Handle media production
      sendTransport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
        console.log(`Producing ${kind} media...`);
        try {
          socket.emit(
            'produce',
            { roomId, transportId: sendTransport.id, kind, rtpParameters },
            (response) => {
              if (response.error) {
                console.error('Error during production:', response.error);
                errback(response.error);
              } else {
                console.log(`${kind} producer created successfully:`, response.producerId);
                callback({ id: response.producerId });
              }
            }
          );
        } catch (error) {
          console.error('Error during production:', error);
          errback(error);
        }
      });

      // Log media capture
      console.log('Getting local media...');
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log('Local media captured:', stream);

      const videoTrack = stream.getVideoTracks()[0];
      setLocalStream(stream);

      const videoElement = document.getElementById('local-video');
      videoElement.srcObject = stream;

      const videoProducer = await sendTransport.produce({ track: videoTrack });
      console.log('Video producer created:', videoProducer);

      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        const audioProducer = await sendTransport.produce({ track: audioTrack });
        console.log('Audio producer created:', audioProducer);
      }
    } catch (error) {
      console.error('Error during streaming:', error);
    }
  }

  return (
    <div>
      <h2>Lecture Room</h2>
      <input
        type="text"
        placeholder="Enter Room ID"
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
      />
      <button onClick={startStreaming}>Start Streaming</button>
      <video id="local-video" autoPlay></video>
    </div>
  );
};

export default LectureRoom;
