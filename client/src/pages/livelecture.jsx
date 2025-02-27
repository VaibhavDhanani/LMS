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
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // 'connecting', 'connected', 'error', 'reconnecting'
  const [error, setError] = useState(null);

  // Refs for persistent values
  const videoRef = useRef(null);
  const socketRef = useRef(null);
  const deviceRef = useRef(null);
  const consumersRef = useRef(new Map());
  const recvTransportRef = useRef(null);
  const roomTokenRef = useRef(null);
  const connectionAttemptsRef = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 3;

  // Hooks
  const { user, token } = useAuth();
  const { id } = useParams();

  // Server URL from environment or fallback
  const SERVER_URL = import.meta.env.VITE_SOCKET_SERVER_URL || 'http://localhost:3000';

  useEffect(() => {
    const initLecture = async () => {
      try {
        setConnectionStatus('connecting');

        // Get room token
        const response = await getRoomToken(id, token);
        const roomToken = response.data.roomToken;
        roomTokenRef.current = roomToken;

        // Connect to WebRTC server
        await connectToServer(roomToken);
      } catch (error) {
        console.error('Error initializing lecture:', error);
        setError(`Failed to connect: ${error.message || 'Unknown error'}`);
        setConnectionStatus('error');
      }
    };

    initLecture();

    // Cleanup function
    return () => {
      cleanup();
    };
  }, [id, token]);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
      
      const playVideo = async () => {
        try {
          // Try to play with muted first (browsers are more permissive with muted autoplay)
          videoRef.current.muted = true;
          await videoRef.current.play();
          console.log("Video is playing (muted)");
          
          // After successful muted play, try unmuting if needed
          if (remoteStream.getAudioTracks().length > 0) {
            // Show UI that tells user to click to unmute
            setError("Media is playing muted. Click to enable audio.");
          }
        } catch (err) {
          console.error("Video playback error:", err);
          
          if (err.name === "NotAllowedError") {
            // Make the error message more prominent
            setError("Autoplay blocked. Please click the video to start playback.");
          }
        }
      };
      
      playVideo();
    }
  }, [remoteStream]);

  const connectToServer = async (roomToken) => {
    try {
      // Setup socket connection
      const newSocket = io(SERVER_URL, {
        reconnectionDelayMax: 10000,
        transports: ['websocket']
      });

      // Store socket in ref
      socketRef.current = newSocket;

      // Setup socket event listeners
      setupSocketListeners(newSocket, roomToken);

      return newSocket;
    } catch (error) {
      console.error('Socket connection failed:', error);
      throw new Error('Failed to connect to lecture server');
    }
  };

  const setupSocketListeners = (socket, roomToken) => {
    socket.on('connect', async () => {
      console.log('Socket connected, setting up device');
      connectionAttemptsRef.current = 0;

      try {
        // Initialize device first
        const deviceInstance = await setupDevice(socket);
        deviceRef.current = deviceInstance;

        // Then join the lecture room
        await joinLecture(socket, roomToken, deviceInstance);

        setConnectionStatus('connected');
        setError(null);
      } catch (error) {
        console.error('Failed during connection setup:', error);
        setError('Connection setup failed. Please refresh the page.');
        setConnectionStatus('error');
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnectionStatus('reconnecting');
      setError('Connection lost. Attempting to reconnect...');
      // Socket will attempt to reconnect automatically
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      connectionAttemptsRef.current += 1;

      if (connectionAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setError('Failed to connect after multiple attempts. Please refresh the page.');
        setConnectionStatus('error');
      } else {
        setError(`Connection error (attempt ${connectionAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS}): ${err.message}`);
      }
    });

    socket.on('newProducer', async ({ producerInfo }) => {
      console.log('New producer detected:', producerInfo);
      try {
        // Make sure we have a device
        if (!deviceRef.current) {
          console.log('Device not found in ref, setting up device again');
          deviceRef.current = await setupDevice(socket);
        }

        // Create receive transport if not already created
        if (!recvTransportRef.current) {
          await createRecvTransport(socket, deviceRef.current);
        }

        // Consume the new producer
        await consumeProducer(socket, producerInfo, deviceRef.current);
      } catch (error) {
        console.error('Failed to handle new producer:', error);
        setError(`Failed to receive media: ${error.message}`);
      }
    });

    socket.on('producerClosed', ({ producerId }) => {
      console.log('Producer closed:', producerId);
      handleProducerClosed(producerId);
    });

    // Add more robust error handling
    socket.on('error', (err) => {
      console.error('Socket error:', err);
      setError(`Server error: ${err.message || 'Unknown error'}`);
    });
  };

  const handleProducerClosed = (producerId) => {
    // Find consumers that are associated with this producer
    const consumersToRemove = [];
    let tracksToRemove = [];

    consumersRef.current.forEach((consumer, consumerId) => {
      if (consumer.producerId === producerId) {
        // Mark for removal
        consumersToRemove.push(consumerId);
        tracksToRemove.push(consumer.track.id);

        // Close the consumer
        consumer.close();
      }
    });

    // Remove consumers from map
    consumersToRemove.forEach(id => consumersRef.current.delete(id));

    // Remove tracks from stream (if we have a stream)
    if (remoteStream && tracksToRemove.length > 0) {
      setRemoteStream(prev => {
        if (!prev) return null;

        // Create a new stream with only the tracks we want to keep
        const newStream = new MediaStream();

        prev.getTracks().forEach(track => {
          if (!tracksToRemove.includes(track.id)) {
            newStream.addTrack(track);
          }
        });

        return newStream.getTracks().length > 0 ? newStream : null;
      });
    }
  };

  const setupDevice = async (socket) => {
    try {
      // Get RTP capabilities from server
      const rtpCapabilities = await new Promise((resolve, reject) => {
        socket.emit('getRtpCapabilities', (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response.rtpCapabilities);
        });
      });

      // Create and load device
      const newDevice = new Device();
      await newDevice.load({ routerRtpCapabilities: rtpCapabilities });

      console.log('Device loaded successfully:', newDevice);
      return newDevice;
    } catch (error) {
      console.error('Error setting up device:', error);
      throw new Error(`Device setup failed: ${error.message}`);
    }
  };

  const joinLecture = async (socket, roomToken, deviceInstance) => {
    try {
      // Join the lecture room
      const joinResponse = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Join request timed out')), 10000);

        socket.emit('joinLecture', { roomId: roomToken }, (response) => {
          clearTimeout(timeout);
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });

      console.log('Joined lecture room:', joinResponse);

      // If there are active producers, set up transport and consume
      if (joinResponse.activeProducers?.length > 0) {
        // Create receive transport
        await createRecvTransport(socket, deviceInstance);

        // Consume all active producers
        for (const producer of joinResponse.activeProducers) {
          await consumeProducer(socket, producer, deviceInstance);
        }
      } else {
        console.log('No active producers in the room yet');
      }
    } catch (error) {
      console.error('Join lecture failed:', error);
      throw error;
    }
  };

  const createRecvTransport = async (socket, deviceInstance) => {
    try {
      if (!deviceInstance) {
        throw new Error('Device not initialized');
      }

      // Check if transport already exists
      if (recvTransportRef.current) {
        console.log('Receive transport already exists');
        return recvTransportRef.current;
      }

      console.log('Creating receive transport with device');

      // Request transport parameters from server
      const { transportParams } = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Transport creation timed out')), 10000);

        socket.emit('createTransport', { direction: 'recv' }, (response) => {
          clearTimeout(timeout);
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });

      // Create receive transport with ICE servers
      const recvTransport = deviceInstance.createRecvTransport({
        ...transportParams,
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] }
        ],
      });

      // Handle transport connection
      recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        socket.emit('connectTransport', {
          transportId: recvTransport.id,
          dtlsParameters
        }, (response) => {
          if (response.error) errback(new Error(response.error));
          else callback();
        });
      });

      // Handle transport state changes
      recvTransport.on('connectionstatechange', (state) => {
        console.log(`Transport connection state changed to ${state}`);

        if (state === 'failed' || state === 'closed') {
          // Maybe attempt to recreate transport
          setError(`Media connection failed (state: ${state}). Try refreshing the page.`);
        }
      });

      // Store transport in ref
      recvTransportRef.current = recvTransport;
      console.log('Receive transport created:', recvTransport.id);

      return recvTransport;
    } catch (error) {
      console.error('Transport setup failed:', error);
      throw error;
    }
  };

  const consumeProducer = async (socket, producerInfo, deviceInstance) => {
    try {
      if (!recvTransportRef.current) {
        throw new Error('Transport not ready');
      }

      if (!deviceInstance) {
        throw new Error('Device not initialized');
      }

      // Get consumer parameters from server
      const consumerParams = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Consumer creation timed out')), 10000);

        socket.emit(
          'consumeProducer',
          {
            transportId: recvTransportRef.current.id,
            producerId: producerInfo.id,
            rtpCapabilities: deviceInstance.rtpCapabilities,
          },
          (response) => {
            clearTimeout(timeout);
            if (response.error) reject(new Error(response.error));
            else resolve(response);
          }
        );
      });

      // Create consumer
      const consumer = await recvTransportRef.current.consume({
        id: consumerParams.id,
        producerId: producerInfo.id,
        kind: consumerParams.kind,
        rtpParameters: consumerParams.rtpParameters,
        appData: producerInfo.appData || {},
      });

      // Add event listeners to consumer
      consumer.on("transportclose", () => {
        console.log(`Consumer ${consumer.id} transport closed`);
        handleConsumerClosed(consumer.id);
      });

      consumer.on("trackended", () => {
        console.log(`Consumer ${consumer.id} track ended`);
        handleConsumerClosed(consumer.id);
      });

      // Store consumer reference
      consumersRef.current.set(consumer.id, consumer);

      // Resume consumer
      await consumer.resume();

      // Update stream with new track
      setRemoteStream((prevStream) => {
        const stream = prevStream || new MediaStream();

        // Check if track already exists to prevent duplicates
        const trackExists = stream.getTracks().some(track => track.id === consumer.track.id);

        if (!trackExists) {
          stream.addTrack(consumer.track);
          console.log(`Added ${consumer.track.kind} track to stream`);
        }
        // And log the entire stream
        console.log("Current stream tracks:", stream.getTracks().map(t => ({
          kind: t.kind,
          id: t.id,
          enabled: t.enabled,
          readyState: t.readyState
        })));

        return stream;
      });
      // Add in your consumeProducer function after adding the track
      console.log(`Added ${consumer.track.kind} track to stream. Track ID: ${consumer.track.id}`, {
        enabled: consumer.track.enabled,
        readyState: consumer.track.readyState,
        muted: consumer.track.muted
      });


      return consumer;
    } catch (error) {
      console.error('Failed to consume producer:', error);
      throw error;
    }
  };

  const handleConsumerClosed = (consumerId) => {
    const consumer = consumersRef.current.get(consumerId);
    if (!consumer) return;

    // Close consumer and remove from map
    consumer.close();
    consumersRef.current.delete(consumerId);

    // Remove track from stream
    setRemoteStream(prev => {
      if (!prev) return null;

      const newStream = new MediaStream();
      prev.getTracks().forEach(track => {
        if (track.id !== consumer.track.id) {
          newStream.addTrack(track);
        }
      });

      return newStream.getTracks().length > 0 ? newStream : null;
    });
  };

  const cleanup = () => {
    // Close all consumers
    consumersRef.current.forEach(consumer => {
      try {
        consumer.close();
      } catch (error) {
        console.warn('Error closing consumer:', error);
      }
    });
    consumersRef.current.clear();

    // Close transport
    if (recvTransportRef.current) {
      try {
        recvTransportRef.current.close();
      } catch (error) {
        console.warn('Error closing transport:', error);
      }
      recvTransportRef.current = null;
    }

    // Stop all tracks in the remote stream
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }

    // Disconnect socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  // Handle user-initiated reconnection
  const handleReconnect = async () => {
    // Clean up existing connection
    cleanup();

    // Reset attempt counter
    connectionAttemptsRef.current = 0;

    try {
      setConnectionStatus('connecting');
      setError(null);

      // Use existing room token if available
      if (!roomTokenRef.current) {
        const response = await getRoomToken(id, token);
        roomTokenRef.current = response.data.roomToken;
      }

      // Connect to server and join lecture
      await connectToServer(roomTokenRef.current);
    } catch (error) {
      console.error('Reconnection failed:', error);
      setError(`Failed to reconnect: ${error.message}`);
      setConnectionStatus('error');
    }
  };

  // Render different UI based on connection status
  const renderConnectionState = () => {
    switch (connectionStatus) {
      case 'connecting':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm">Connecting to lecture...</p>
            </div>
          </div>
        );

      case 'reconnecting':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm">Reconnecting...</p>
              <button
                onClick={handleReconnect}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Reconnect manually
              </button>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10">
            <div className="flex flex-col items-center text-center">
              <p className="mt-2 text-sm text-red-500">{error || 'Failed to connect'}</p>
              <button
                onClick={handleReconnect}
                className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                Try again
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Live Lecture Stream</h2>

      {error && connectionStatus !== 'error' && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        {renderConnectionState()}

        <video
  ref={videoRef}
  autoPlay
  playsInline
  controls
  className="w-full max-w-2xl mt-4 bg-black rounded-lg"
  style={{ minHeight: '300px' }}
  onLoadedMetadata={() => console.log("Video loadedmetadata event fired")}
  onCanPlay={() => console.log("Video canplay event fired")}
  onPlaying={() => console.log("Video playing event fired")}
  onWaiting={() => console.log("Video waiting event - buffering")}
  onStalled={() => console.log("Video stalled event fired")}
  onError={(e) => console.error("Video element error:", e.target.error)}
  onClick={() => {
    if (videoRef.current && videoRef.current.paused) {
      videoRef.current.play()
        .then(() => console.log("Video played via click"))
        .catch(err => console.error('Play failed via click:', err));
    }
  }}
/>
      </div>
    </div>
  );
};

export default LiveLecture;