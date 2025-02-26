import React, { useState, useRef, useEffect } from 'react';
import { Device } from 'mediasoup-client';
import io from 'socket.io-client';
import { getRoomToken } from '../services/lecture.service';
import { useAuth } from '@/context/AuthContext';
import { useParams } from "react-router-dom";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

const LiveLecture = () => {
  // State management
  const [remoteStream, setRemoteStream] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [device, setDevice] = useState(null);
  const [connectionState, setConnectionState] = useState({
    status: 'disconnected',
    error: null,
    isLoading: false,
    transportReady: false
  });
  
  // Refs for persistent values
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const consumersRef = useRef(new Map());
  const recvTransportRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  
  // Hooks
  const { user, token } = useAuth();
  const { id } = useParams();

  const setupRecvTransport = async (deviceInstance, transportParams) => {
    try {
      const recvTransport = deviceInstance.createRecvTransport({
        ...transportParams,
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] }
        ],
      });
      console.log(recvTransport);
      recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        socketRef.current.emit('connectTransport', {
          transportId: recvTransport.id,
          dtlsParameters
        }, (response) => {
          if (response.error) errback(new Error(response.error));
          else callback();
        });
      });

      // Store transport reference
      recvTransportRef.current = recvTransport;
      
      setConnectionState(prev => ({
        ...prev,
        transportReady: true
      }));

      return recvTransport;
    } catch (error) {
      console.error('Transport setup failed:', error);
      throw error;
    }
  };

  const consumeProducer = async (producerInfo) => {
    try {
      if (!recvTransportRef.current || !device) {
        throw new Error('Transport or device not ready');
      }

      const { consumerParams } = await new Promise((resolve, reject) => {
        socketRef.current.emit('consumeProducer', {
          transportId: recvTransportRef.current.id,
          producerId: producerInfo.producerId,
          rtpCapabilities: device.rtpCapabilities
        }, (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });

      const consumer = await recvTransportRef.current.consume({
        ...consumerParams,
        producerId: producerInfo.producerId,
      });

      consumersRef.current.set(consumer.id, consumer);
      await consumer.resume();

      // Update stream with new track
      setRemoteStream(prev => {
        const newStream = prev || new MediaStream();
        newStream.addTrack(consumer.track);
        return newStream;
      });

    } catch (error) {
      console.error('Failed to consume producer:', error);
      throw error;
    }
  };

  const initializeDevice = async () => {
    try {
      const { rtpCapabilities } = await new Promise((resolve, reject) => {
        socketRef.current.emit('getRtpCapabilities', (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });

      const newDevice = new Device();
      await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
      setDevice(newDevice);
      return newDevice;
    } catch (error) {
      throw new Error(`Device initialization failed: ${error.message}`);
    }
  };

  const setupSocketListeners = (socket) => {
    socket.on('connect', async () => {
      console.log('Socket connected');
      setConnectionState(prev => ({
        ...prev,
        status: 'connected',
        error: null
      }));
      await joinLecture();
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnectionState(prev => ({
        ...prev,
        status: 'disconnected',
        transportReady: false
      }));

      // Attempt reconnection after delay
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      reconnectTimeoutRef.current = setTimeout(connectToSocket, 5000);
    });

    socket.on('newProducer', async (producerInfo) => {
      console.log('New producer detected:', producerInfo);
      try {
        if (!device) {
          const deviceInstance = await initializeDevice();
          setDevice(deviceInstance);
        }

        if (!connectionState.transportReady) {
          const { transportParams } = await new Promise((resolve, reject) => {
            socket.emit('createTransport', { direction: 'recv' }, (response) => {
              if (response.error) reject(new Error(response.error));
              else resolve(response);
            });
          });
          // console.log(transportParams);
          await setupRecvTransport(device, transportParams);
        }

        await consumeProducer(producerInfo);
        
        setConnectionState(prev => ({
          ...prev,
          status: 'streaming',
          isLoading: false
        }));
      } catch (error) {
        console.error('Failed to handle new producer:', error);
        setConnectionState(prev => ({
          ...prev,
          error: 'Failed to connect to stream'
        }));
      }
    });

    socket.on('producerClosed', ({ producerId }) => {
      console.log('Producer closed:', producerId);
      if (consumersRef.current.has(producerId)) {
        const consumer = consumersRef.current.get(producerId);
        consumer.close();
        consumersRef.current.delete(producerId);

        // Remove track from stream
        setRemoteStream(prev => {
          if (!prev) return null;
          const newStream = new MediaStream();
          prev.getTracks().forEach(track => {
            if (track.id !== consumer.track.id) {
              newStream.addTrack(track);
            }
          });
          return newStream;
        });
      }
    });
  };

  const connectToSocket = () => {
    if (socketRef.current?.connected) return;

    setConnectionState(prev => ({ ...prev, isLoading: true }));
    
    const socket = io('http://localhost:3000', {
      reconnectionDelayMax: 10000,
      transports: ['websocket']
    });

    setupSocketListeners(socket);
    socketRef.current = socket;
  };

  const joinLecture = async () => {
    try {
      const response = await getRoomToken(id, token);
      const roomToken = response.data.roomToken;
      
      if (!roomToken) {
        throw new Error('Invalid room token');
      }

      setRoomId(roomToken);

      const joinResponse = await new Promise((resolve, reject) => {
        socketRef.current.emit('joinLecture', { roomId: roomToken }, (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });

      // If there are active producers, set up device and consume
      if (joinResponse.activeProducers?.length > 0) {
        const deviceInstance = device || await initializeDevice();
        const { transportParams } = await new Promise((resolve, reject) => {
          socketRef.current.emit('createTransport', { direction: 'recv' }, (response) => {
            if (response.error) reject(new Error(response.error));
            else resolve(response);
          });
        });
        
        await setupRecvTransport(deviceInstance, transportParams);
        
        // Consume all active producers
        for (const producer of joinResponse.activeProducers) {
          await consumeProducer(producer);
        }
        
        setConnectionState(prev => ({
          ...prev,
          status: 'streaming',
          isLoading: false
        }));
      } else {
        setConnectionState(prev => ({
          ...prev,
          status: 'waiting',
          isLoading: false
        }));
      }
    } catch (error) {
      console.error('Join lecture failed:', error);
      setConnectionState(prev => ({
        ...prev,
        status: 'error',
        error: `Failed to join lecture: ${error.message}`,
        isLoading: false
      }));
    }
  };

  // Initial connection
  useEffect(() => {
    connectToSocket();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      cleanup();
    };
  }, []);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const cleanup = () => {
    consumersRef.current.forEach(consumer => {
      try {
        consumer.close();
      } catch (error) {
        console.warn('Error closing consumer:', error);
      }
    });
    consumersRef.current.clear();

    if (recvTransportRef.current) {
      try {
        recvTransportRef.current.close();
      } catch (error) {
        console.warn('Error closing transport:', error);
      }
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  };

  // ... rest of your component (render method etc.) remains the same

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Live Lecture Stream</h2>
  
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          controls
          className="w-full max-w-2xl mt-4 bg-black rounded-lg"
          style={{ minHeight: '300px' }}
        />
        {connectionState.status === 'disconnected' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <span className="text-white">Connection lost. Attempting to reconnect...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveLecture;