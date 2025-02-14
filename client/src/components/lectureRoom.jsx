import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Device } from 'mediasoup-client';

const LectureRoom = () => {
  const [device, setDevice] = useState(null);
  const [transport, setTransport] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [socket, setSocket] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [debugInfo, setDebugInfo] = useState({});
  const producersRef = useRef(new Map());

  const updateDebugInfo = (key, value) => {
    setDebugInfo(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
      updateDebugInfo('socketStatus', 'Connected');
      setupDevice(newSocket);
    });

    return () => {
      cleanup();
      newSocket.disconnect();
    };
  }, []);

  const cleanup = () => {
    // Cleanup producers
    producersRef.current.forEach(producer => {
      try {
        producer.close();
      } catch (error) {
        console.error('Error closing producer:', error);
      }
    });
    producersRef.current.clear();

    // Cleanup transport
    if (transport) {
      try {
        transport.close();
      } catch (error) {
        console.error('Error closing transport:', error);
      }
    }

    // Cleanup local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
  };

  async function setupDevice(socket) {
    try {
      if (!socket) {
        throw new Error('Socket is not initialized');
      }

      const { rtpCapabilities } = await new Promise((resolve, reject) => {
        socket.emit('getRtpCapabilities', (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });

      console.log('RTP Capabilities:', rtpCapabilities);
      updateDebugInfo('rtpCapabilities', rtpCapabilities);

      const newDevice = new Device();
      await newDevice.load({ routerRtpCapabilities: rtpCapabilities });

      setDevice(newDevice);
      updateDebugInfo('deviceStatus', 'Loaded');
      console.log('Device loaded successfully:', newDevice);
    } catch (error) {
      console.error('Error setting up device:', error);
      updateDebugInfo('deviceError', error.message);
    }
  }

  async function startStreaming() {
    if (!roomId || !socket || !device) {
      alert('Room ID, socket, or device not ready');
      return;
    }

    try {
      if (isStreaming) {
        cleanup();
        setIsStreaming(false);
        updateDebugInfo('streamingStatus', 'Stopped');
        return;
      }

      console.log('Requesting transport creation...');
      updateDebugInfo('streamingStatus', 'Creating Transport');

      const { transportParams } = await new Promise((resolve, reject) => {
        socket.emit('createTransport', { direction: 'send', roomId }, (response) => {
          if (response.error) reject(new Error(response.error));
          else resolve(response);
        });
      });

      console.log('Transport params:', transportParams);
      updateDebugInfo('transportParams', 'Received');

      const sendTransport = device.createSendTransport(transportParams);
      setTransport(sendTransport);

      sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        console.log('Connecting transport...');
        updateDebugInfo('transportStatus', 'Connecting');
        
        socket.emit('connectTransport', {
          transportId: sendTransport.id,
          dtlsParameters
        }, (response) => {
          if (response.error) {
            updateDebugInfo('transportError', response.error);
            errback(new Error(response.error));
          } else {
            updateDebugInfo('transportStatus', 'Connected');
            callback();
          }
        });
      });

      sendTransport.on('connectionstatechange', (state) => {
        console.log('Transport connection state:', state);
        updateDebugInfo('transportState', state);
      });

      sendTransport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
        console.log(`Producing ${kind} media...`);
        updateDebugInfo(`producing_${kind}`, 'Starting');
        
        socket.emit('produce', {
          roomId,
          transportId: sendTransport.id,
          kind,
          rtpParameters
        }, (response) => {
          if (response.error) {
            updateDebugInfo(`produceError_${kind}`, response.error);
            errback(new Error(response.error));
          } else {
            updateDebugInfo(`producer_${kind}`, response.producerId);
            callback({ id: response.producerId });
          }
        });
      });

      console.log('Getting local media...');
      updateDebugInfo('mediaStatus', 'Requesting');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      console.log('Local media captured:', {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });
      
      setLocalStream(stream);
      updateDebugInfo('mediaStatus', 'Captured');

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      const videoElement = document.getElementById('local-video');
      if (videoElement) {
        videoElement.srcObject = stream;
        videoElement.onloadedmetadata = () => {
          videoElement.play().catch(error => {
            console.error('Error playing video:', error);
            updateDebugInfo('videoPlayError', error.message);
          });
        };
      }

      // Produce video
      if (videoTrack) {
        const videoProducer = await sendTransport.produce({ track: videoTrack });
        console.log('Video producer created:', videoProducer.id);
        producersRef.current.set('video', videoProducer);
        
        videoProducer.on('trackended', () => {
          console.log('Video track ended');
          updateDebugInfo('videoTrackStatus', 'Ended');
        });
        
        videoProducer.on('transportclose', () => {
          console.log('Video transport closed');
          updateDebugInfo('videoTransportStatus', 'Closed');
        });
      }

      // Produce audio
      if (audioTrack) {
        const audioProducer = await sendTransport.produce({ track: audioTrack });
        console.log('Audio producer created:', audioProducer.id);
        producersRef.current.set('audio', audioProducer);
        
        audioProducer.on('trackended', () => {
          console.log('Audio track ended');
          updateDebugInfo('audioTrackStatus', 'Ended');
        });
        
        audioProducer.on('transportclose', () => {
          console.log('Audio transport closed');
          updateDebugInfo('audioTransportStatus', 'Closed');
        });
      }

      setIsStreaming(true);
      updateDebugInfo('streamingStatus', 'Active');

    } catch (error) {
      console.error('Error during streaming:', error);
      updateDebugInfo('streamingError', error.message);
      cleanup();
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lecture Room</h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="border p-2 rounded w-full max-w-md"
        />
        <button
          onClick={startStreaming}
          className={`px-4 py-2 rounded ${
            isStreaming ? 'bg-red-500' : 'bg-blue-500'
          } text-white`}
        >
          {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
        </button>
        <video
          id="local-video"
          autoPlay
          playsInline
          muted
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

export default LectureRoom;