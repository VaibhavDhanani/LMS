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
  const [producers, setProducers] = useState(null);
  const [device, setDevice] = useState(null);
  const [connectionState, setConnectionState] = useState({
    status: 'disconnected',
    error: null,
    isLoading: false
  });
  
  // Refs
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const consumersRef = useRef(new Map());
  
  // Hooks
  const { user, token } = useAuth();
  const { id } = useParams();

  useEffect(() => {
    connectToSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      cleanup();
    };
  }, []);

  const cleanup = () => {
    // Clean up consumers
    consumersRef.current.forEach(consumer => {
      try {
        consumer.close();
      } catch (error) {
        console.warn('Error closing consumer:', error);
      }
    });
    consumersRef.current.clear();

    // Clean up stream
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
  };

  const connectToSocket = () => {
    setConnectionState(prev => ({ ...prev, isLoading: true }));
    
    const newSocket = io('http://localhost:3000', {
      reconnectionDelayMax: 10000,
      transports: ['websocket']
    });

    newSocket.on('connect', () => {
      setConnectionState(prev => ({
        ...prev,
        status: 'connected',
        error: null
      }));
      socketRef.current = newSocket;
      joinLecture();
    });

    newSocket.on('connect_error', (error) => {
      setConnectionState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to connect to server'
      }));
    });

    newSocket.on('disconnect', () => {
      setConnectionState(prev => ({
        ...prev,
        status: 'disconnected'
      }));
    });
  };

  const initializeDevice = async () => {
    try {
      if (!socketRef.current) {
        throw new Error('Socket not connected');
      }

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

  const joinLecture = async () => {
    try {
      setConnectionState(prev => ({ ...prev, isLoading: true }));

      const response = await getRoomToken(id, token);
      const fetchedRoomToken = response.data.roomToken;
      
      if (!fetchedRoomToken) {
        throw new Error('Invalid room token');
      }

      const joinResponse = await new Promise((resolve, reject) => {
        socketRef.current.emit('joinLecture', { roomId: fetchedRoomToken }, (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });

      setRoomId(fetchedRoomToken);
      setProducers(joinResponse);

      const deviceInstance = device || await initializeDevice();
      await consumeMedia(deviceInstance, fetchedRoomToken);

      setConnectionState(prev => ({
        ...prev,
        status: 'streaming',
        isLoading: false,
        error: null
      }));

    } catch (error) {
      setConnectionState(prev => ({
        status: 'error',
        isLoading: false,
        error: `Failed to join lecture: ${error.message}`
      }));
    }
  };

  const consumeMedia = async (deviceInstance, currentRoomId) => {
    if (!currentRoomId || !deviceInstance) {
      throw new Error('Missing required parameters for media consumption');
    }

    try {
      const { transportParams } = await new Promise((resolve, reject) => {
        socketRef.current.emit('createTransport', { direction: 'recv' }, (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });

      const recvTransport = deviceInstance.createRecvTransport({
        ...transportParams,
        iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }],
      });

      recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        socketRef.current.emit('connectTransport', {
          transportId: recvTransport.id,
          dtlsParameters
        }, (response) => {
          if (response.error) errback(new Error(response.error));
          else callback();
        });
      });

      const consumeResponses = await new Promise((resolve, reject) => {
        socketRef.current.emit('consume', {
          transportId: recvTransport.id,
          rtpCapabilities: deviceInstance.rtpCapabilities,
          roomId: currentRoomId,
        }, (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });

      const mediaStreams = new MediaStream();

      for (const consumerInfo of consumeResponses) {
        const consumer = await recvTransport.consume({
          id: consumerInfo.id,
          producerId: consumerInfo.producerId,
          kind: consumerInfo.kind,
          rtpParameters: consumerInfo.rtpParameters,
        });

        consumersRef.current.set(consumer.id, consumer);
        await consumer.resume();
        mediaStreams.addTrack(consumer.track);
      }

      setRemoteStream(mediaStreams);

    } catch (error) {
      throw new Error(`Media consumption failed: ${error.message}`);
    }
  };

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const renderConnectionStatus = () => {
    if (connectionState.error) {
      return (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{connectionState.error}</AlertDescription>
        </Alert>
      );
    }

    if (connectionState.isLoading) {
      return (
        <div className="flex items-center gap-2 mb-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Connecting to lecture...</span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Live Lecture Stream</h2>
      {renderConnectionStatus()}
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