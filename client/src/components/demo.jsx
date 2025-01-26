import React, { useState, useRef, useEffect } from 'react';
import { Device } from 'mediasoup-client';
import io from 'socket.io-client';

const LectureRoom1 = () => {
  const [remoteStream, setRemoteStream] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [producers,setProducers]= useState(null);
  const [device, setDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const videoRef = useRef(null);
  const [socket, setSocket] = useState(null); // Store the socket instance in state

  useEffect(() => {
    // Initialize the socket connection
    const newSocket = io('http://172.20.10.6:3000');
    setSocket(newSocket); // Save the socket instance in state

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    // Clean up the socket connection on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);


  // Monitor video element and stream changes
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      console.log('Setting stream to video element:', remoteStream);
      console.log('Video tracks:', remoteStream.getVideoTracks());
      console.log('Audio tracks:', remoteStream.getAudioTracks());
      
      videoRef.current.srcObject = remoteStream;
      
      // Log when the video starts playing
      videoRef.current.onplaying = () => {
        console.log('Video started playing');
      };

      // Log any errors
      videoRef.current.onerror = (error) => {
        console.error('Video element error:', error);
      };
    }
  }, [remoteStream]);

  const initializeDevice = async () => {
    try {
      console.log('Requesting RTP capabilities...');
      const { rtpCapabilities } = await new Promise((resolve, reject) => {
        socket.emit('getRtpCapabilities', (response) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            console.log('Received RTP capabilities:', response.rtpCapabilities);
            resolve(response);
          }
        });
      });

      const newDevice = new Device();
      await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
      console.log('Device loaded successfully');
      setDevice(newDevice);
    } catch (error) {
      console.error('Error initializing device:', error);
      throw error;
    }
  };

  const joinLecture = async () => {
    if (!roomId.trim()) {
      alert('Please enter a valid room ID.');
      return;
    }

    try {
      console.log(`Joining lecture for room ID: ${roomId}`);
      const producers = await new Promise((resolve, reject) => {
        socket.emit('joinLecture', { roomId }, (response) => {
          if (response.error) {
            reject(new Error(response.error));
          } else {
            console.log('Joined lecture');
            resolve(response);
          }
        });
      });
      setProducers(producers);
      setRoomId(roomId);
      setIsConnected(true);

      if (!device) {
        await initializeDevice();
      }
    } catch (error) {
      console.error('Error joining lecture:', error);
      alert('Failed to join lecture: ' + error.message);
    }
  };

  const consumeMedia = async () => {
    if (!roomId || !device || producers.length < 2) {
      alert('Room ID, device, or producers are not available. Join a lecture first.');
      return;
    }
  
    try {
      console.log('Starting media consumption...');
  
      // Filter the producers into video and audio
      const videoProducer = producers.find(producer => producer.kind === 'video');
      const audioProducer = producers.find(producer => producer.kind === 'audio');
  
      console.log('Video Producer:', videoProducer);
      console.log('Audio Producer:', audioProducer);
  
      if (!videoProducer || !audioProducer) {
        throw new Error('Both video and audio producers are required');
      }
  
      // Create receiving transport
      const { transportParams } = await new Promise((resolve, reject) => {
        socket.emit('createTransport', { direction: 'recv' }, (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });
  
      console.log('Created receive transport:', transportParams);
      const recvTransport = device.createRecvTransport(transportParams);
  
      // Handle transport connection
      recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        console.log('Connecting transport...');
        socket.emit('connectTransport', {
          transportId: recvTransport.id,
          dtlsParameters
        }, (response) => {
          if (response.error) {
            errback(new Error(response.error));
          } else {
            console.log('Transport connected successfully');
            callback();
          }
        });
      });
  
      // Handle transport connection state changes
      recvTransport.on('connectionstatechange', (state) => {
        console.log('Transport connection state:', state);
      });
  
      // Consume both video and audio producers
      const consumeResponses = await new Promise((resolve, reject) => {
        socket.emit('consume', {
          transportId: recvTransport.id,
          rtpCapabilities: device.rtpCapabilities,
          roomId, // Pass roomId while emitting consume event
        }, (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });
  
      console.log('Consumer responses:', consumeResponses);
  
      // Create consumers for both video and audio
      for (const consumerInfo of consumeResponses) {
        console.log(`Creating consumer for producerId: ${consumerInfo.producerId}`);
        const consumer = await recvTransport.consume({
          id: consumerInfo.id,
          producerId: consumerInfo.producerId,
          kind: consumerInfo.kind,
          rtpParameters: consumerInfo.rtpParameters,
        });
  
        console.log(`Consumer created for ${consumer.kind}:`, consumer);
  
        // Handle consumer closure
        consumer.on('close', () => {
          console.log(`Consumer closed: ${consumer.id}`);
        });
  
        // Attach streams to media elements
        if (consumer.kind === 'video') {
          const videoStream = new MediaStream([consumer.track]);
          if (videoRef.current) {
            videoRef.current.srcObject = videoStream;
            await videoRef.current.play();
          } else {
            console.error('Video ref is not attached to an element');
          }
        } else if (consumer.kind === 'audio') {
          const audioStream = new MediaStream([consumer.track]);
          
          // Create an audio element dynamically for audio
          const audioElement = document.createElement('audio');
          audioElement.srcObject = audioStream;
          audioElement.play().catch((error) => {
            console.error('Error playing audio:', error);
          });
        }
      }
  
    } catch (error) {
      console.error('Error consuming media:', error);
      alert('Failed to consume media: ' + error.message);
    }
  };
  
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Media Receiver</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="border p-2 rounded w-full max-w-md"
        />
        <div className="space-x-4">
          <button
            onClick={joinLecture}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Join Lecture
          </button>
          <button
            onClick={consumeMedia}
            className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={!isConnected}
          >
            Consume Media
          </button>
        </div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          className="w-full max-w-2xl mt-4 bg-black"
          style={{ minHeight: '300px' }}
        />
        {remoteStream && (
          <div className="mt-2 text-sm text-gray-600">
            Stream Status: Active
            <br />
            Video Tracks: {remoteStream.getVideoTracks().length}
            <br />
            Audio Tracks: {remoteStream.getAudioTracks().length}
          </div>
        )}
      </div>
    </div>
  );
};

export default LectureRoom1;
