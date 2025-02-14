import React, { useState, useRef, useEffect } from 'react';
import { Device } from 'mediasoup-client';
import io from 'socket.io-client';

const LectureRoom1 = () => {
  const [remoteStream, setRemoteStream] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [producers, setProducers] = useState(null);
  const [device, setDevice] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const videoRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});
  const consumersRef = useRef(new Map());

  const updateDebugInfo = (key, value) => {
    setDebugInfo(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      updateDebugInfo('socketStatus', 'Connected');
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      console.log('Setting stream to video element:', remoteStream);
      
      const videoTracks = remoteStream.getVideoTracks();
      
      videoTracks.forEach((track, index) => {
        console.log(`Video Track ${index} details:`, {
          id: track.id,
          readyState: track.readyState,
          enabled: track.enabled,
          muted: track.muted
        });
        
        track.onmute = () => {
          console.log(`Video track ${index} muted`);
          updateDebugInfo(`videoTrack${index}Status`, 'Muted');
        };
        
        track.onunmute = () => {
          console.log(`Video track ${index} unmuted`);
          updateDebugInfo(`videoTrack${index}Status`, 'Active');
        };
        
        track.onended = () => {
          console.log(`Video track ${index} ended`);
          updateDebugInfo(`videoTrack${index}Status`, 'Ended');
        };
      });

      videoRef.current.srcObject = remoteStream;
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded');
        videoRef.current.play()
          .then(() => {
            console.log('Video playback started');
            updateDebugInfo('playbackStatus', 'Playing');
          })
          .catch(error => {
            console.error('Playback failed:', error);
            updateDebugInfo('playbackStatus', `Failed: ${error.message}`);
          });
      };
    }
  }, [remoteStream]);

  const consumeMedia = async () => {
    if (!roomId || !device || producers.length < 2) {
      alert('Room ID, device, or producers are not available. Join a lecture first.');
      return;
    }

    try {
      console.log('Starting media consumption...');
      updateDebugInfo('consumeStatus', 'Starting');

      const { transportParams } = await new Promise((resolve, reject) => {
        socket.emit('createTransport', { direction: 'recv' }, (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });

      console.log('Transport params received:', transportParams);
      updateDebugInfo('transportParams', 'Received');

      const recvTransport = device.createRecvTransport({
        ...transportParams,
        iceServers: [
          { urls: ['stun:stun.l.google.com:19302'] }
        ],
      });

      // Monitor transport connection state
      recvTransport.on('connectionstatechange', (state) => {
        console.log('Transport connection state:', state);
        updateDebugInfo('transportState', state);
      });

      // Monitor transport stats
      const monitorTransportStats = async () => {
        try {
          const stats = await recvTransport.getStats();
          const transportStats = {
            bytesReceived: 0,
            packetsReceived: 0,
          };
          
          stats.forEach(stat => {
            if (stat.type === 'transport') {
              transportStats.bytesReceived += stat.bytesReceived || 0;
              transportStats.packetsReceived += stat.packetsReceived || 0;
            }
          });
          
          console.log('Transport stats:', transportStats);
          updateDebugInfo('transportStats', transportStats);
        } catch (error) {
          console.error('Error getting transport stats:', error);
        }
      };

      const statsInterval = setInterval(monitorTransportStats, 2000);

      recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        console.log('Transport connect event triggered');
        updateDebugInfo('transportConnect', 'Connecting');
        
        socket.emit('connectTransport', {
          transportId: recvTransport.id,
          dtlsParameters
        }, (response) => {
          if (response.error) {
            console.error('Transport connect error:', response.error);
            updateDebugInfo('transportConnect', 'Failed');
            errback(new Error(response.error));
          } else {
            console.log('Transport connected successfully');
            updateDebugInfo('transportConnect', 'Connected');
            callback();
          }
        });
      });

      const consumeResponses = await new Promise((resolve, reject) => {
        socket.emit('consume', {
          transportId: recvTransport.id,
          rtpCapabilities: device.rtpCapabilities,
          roomId,
        }, (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });

      console.log('Consume responses:', consumeResponses);
      updateDebugInfo('consumeResponses', 'Received');

      const mediaStreams = new MediaStream();

      for (const consumerInfo of consumeResponses) {
        try {
          console.log(`Creating consumer for ${consumerInfo.kind}:`, consumerInfo);
          
          const consumer = await recvTransport.consume({
            id: consumerInfo.id,
            producerId: consumerInfo.producerId,
            kind: consumerInfo.kind,
            rtpParameters: consumerInfo.rtpParameters,
          });

          consumersRef.current.set(consumer.id, consumer);
          
          console.log(`Consumer created:`, {
            id: consumer.id,
            kind: consumer.kind,
            trackId: consumer.track.id,
            paused: consumer.paused
          });

          consumer.on('transportclose', () => {
            console.log(`Consumer transport closed: ${consumer.id}`);
            updateDebugInfo(`consumer_${consumer.kind}`, 'TransportClosed');
          });

          consumer.on('trackended', () => {
            console.log(`Consumer track ended: ${consumer.id}`);
            updateDebugInfo(`consumer_${consumer.kind}`, 'TrackEnded');
          });

          // Try to resume the consumer
          await consumer.resume();
          console.log(`Consumer ${consumer.id} resumed`);
          
          mediaStreams.addTrack(consumer.track);
          
        } catch (error) {
          console.error(`Error creating consumer:`, error);
          updateDebugInfo('consumerError', error.message);
        }
      }

      setRemoteStream(mediaStreams);
      updateDebugInfo('streamStatus', 'Created');

      return () => {
        clearInterval(statsInterval);
      };

    } catch (error) {
      console.error('Error in consumeMedia:', error);
      updateDebugInfo('error', error.message);
      alert('Failed to consume media: ' + error.message);
    }
  };
  // Rest of your existing functions remain the same until consumeMedia
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
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Debug Information:</h3>
          <pre className="whitespace-pre-wrap text-sm">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default LectureRoom1;
          // const consumeMedia = async () => {
          //   if (!roomId || !device || producers.length < 2) {
          //     alert('Room ID, device, or producers are not available. Join a lecture first.');
          //     return;
          //   }
        
          //   try {
          //     console.log('Starting media consumption...');
          //     updateDebugInfo('consumeStatus', 'Starting');
        
          //     const videoProducer = producers.find(producer => producer.kind === 'video');
          //     const audioProducer = producers.find(producer => producer.kind === 'audio');
        
          //     console.log('Video Producer:', videoProducer);
          //     console.log('Audio Producer:', audioProducer);
          //     updateDebugInfo('producers', { video: !!videoProducer, audio: !!audioProducer });
        
          //     if (!videoProducer || !audioProducer) {
          //       throw new Error('Both video and audio producers are required');
          //     }
        
          //     const { transportParams } = await new Promise((resolve, reject) => {
          //       socket.emit('createTransport', { direction: 'recv' }, (response) => {
          //         if (response.error) reject(new Error(response.error));
          //         else resolve(response);
          //       });
          //     });
        
          //     console.log('Created receive transport:', transportParams);
          //     const recvTransport = device.createRecvTransport(transportParams);
          //     updateDebugInfo('transportStatus', 'Created');
        
          //     recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
          //       console.log('Connecting transport...');
          //       socket.emit('connectTransport', {
          //         transportId: recvTransport.id,
          //         dtlsParameters
          //       }, (response) => {
          //         if (response.error) {
          //           errback(new Error(response.error));
          //           updateDebugInfo('transportConnection', 'Failed');
          //         } else {
          //           console.log('Transport connected successfully');
          //           updateDebugInfo('transportConnection', 'Connected');
          //           callback();
          //         }
          //       });
          //     });
        
          //     recvTransport.on('connectionstatechange', (state) => {
          //       console.log('Transport connection state:', state);
          //       updateDebugInfo('transportState', state);
          //     });
        
          //     const consumeResponses = await new Promise((resolve, reject) => {
          //       socket.emit('consume', {
          //         transportId: recvTransport.id,
          //         rtpCapabilities: device.rtpCapabilities,
          //         roomId,
          //       }, (response) => {
          //         if (response.error) reject(new Error(response.error));
          //         else resolve(response);
          //       });
          //     });
        
          //     const mediaStreams = new MediaStream();
              
          //     for (const consumerInfo of consumeResponses) {
          //       console.log(`Creating consumer for ${consumerInfo.kind}:`, consumerInfo);
                
          //       const consumer = await recvTransport.consume({
          //         id: consumerInfo.id,
          //         producerId: consumerInfo.producerId,
          //         kind: consumerInfo.kind,
          //         rtpParameters: consumerInfo.rtpParameters,
          //       });
        
          //       console.log(`Consumer created for ${consumer.kind}:`, consumer);
          //       updateDebugInfo(`consumer_${consumer.kind}`, 'Created');
        
          //       consumer.on('transportclose', () => {
          //         console.log(`Consumer transport closed: ${consumer.id}`);
          //         updateDebugInfo(`consumer_${consumer.kind}`, 'TransportClosed');
          //       });
        
          //       consumer.on('trackended', () => {
          //         console.log(`Consumer track ended: ${consumer.id}`);
          //         updateDebugInfo(`consumer_${consumer.kind}`, 'TrackEnded');
          //       });
        
          //       mediaStreams.addTrack(consumer.track);
          //     }
        
          //     setRemoteStream(mediaStreams);
          //     updateDebugInfo('streamStatus', 'Created');
        
          //   } catch (error) {
          //     console.error('Error consuming media:', error);
          //     updateDebugInfo('error', error.message);
          //     alert('Failed to consume media: ' + error.message);
          //   }
          // };