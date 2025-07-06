import { useEffect, useRef, useState } from 'react';
import { Device } from 'mediasoup-client';
import io from 'socket.io-client';

const SocketURL = import.meta.env.VITE_SOCKET_URL;

export const useLiveLectureConsumer = ({ roomId, user, onLectureEnded }) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [error, setError] = useState(null);
  const [joinedRoom, setJoinedRoom] = useState(false);

  const socketRef = useRef(null);
  const deviceRef = useRef(null);
  const consumersRef = useRef(new Map());
  const recvTransportRef = useRef(null);
  const connectionAttemptsRef = useRef(0);

  const MAX_RECONNECT_ATTEMPTS = 3;

  useEffect(() => {
    connectToServer(roomId);
    return cleanup;
  }, [roomId]);

  const connectToServer = async (roomId) => {
    try {
      const socket = io(SocketURL, { transports: ['websocket'] });
      socketRef.current = socket;

      setupSocketListeners(socket, roomId);
    } catch (err) {
      setError('Failed to connect to lecture server');
      setConnectionStatus('error');
    }
  };

  const setupSocketListeners = (socket, roomId) => {
    socket.on('connect', async () => {
      try {
        const device = await setupDevice(socket);
        deviceRef.current = device;
        await joinLecture(socket, roomId, device);
      } catch (err) {
        setError('Connection setup failed');
        setConnectionStatus('error');
      }
    });

    socket.on('disconnect', () => {
      setConnectionStatus('reconnecting');
      setError('Connection lost. Attempting to reconnect...');
    });

    socket.on('lectureEnded', () => {
      socket.disconnect();
      onLectureEnded?.();
    });

    socket.on('connect_error', () => {
      connectionAttemptsRef.current += 1;
      if (connectionAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setConnectionStatus('error');
        setError('Failed to reconnect after multiple attempts.');
      }
    });

    socket.on('newProducer', async ({ producerInfo }) => {
      try {
        if (!deviceRef.current) {
          deviceRef.current = await setupDevice(socket);
        }
        if (!recvTransportRef.current) {
          await createRecvTransport(socket, deviceRef.current);
        }
        await consumeProducer(socket, producerInfo, deviceRef.current);
        setConnectionStatus('connected');
      } catch (err) {
        setError('Failed to consume new producer');
      }
    });

    socket.on('producerClosed', ({ producerId }) => {
      handleProducerClosed(producerId);
      if (consumersRef.current.size === 0) {
        setConnectionStatus('waiting');
        setError('Host disconnected. Waiting...');
      }
    });

    socket.on('error', (err) => {
      setError(`Server error: ${err.message}`);
    });
  };

  const setupDevice = async (socket) => {
    const { rtpCapabilities } = await new Promise((resolve, reject) => {
      socket.emit('getRtpCapabilities', (res) => {
        res.error ? reject(res.error) : resolve(res);
      });
    });

    const device = new Device();
    await device.load({ routerRtpCapabilities: rtpCapabilities });
    return device;
  };

  const joinLecture = async (socket, roomId, device) => {
    const response = await new Promise((resolve, reject) => {
      socket.emit('joinLecture', { roomId, userInfo: user }, (res) => {
        res.error ? reject(res.error) : resolve(res);
      });
    });

    setJoinedRoom(true);
    if (response.producers?.length > 0) {
      await createRecvTransport(socket, device);
      for (const p of response.producers) {
        await consumeProducer(socket, p, device);
      }
      setConnectionStatus('connected');
    } else {
      setConnectionStatus('waiting');
    }
  };

  const createRecvTransport = async (socket, device) => {
    if (recvTransportRef.current) return recvTransportRef.current;

    const { transportParams } = await new Promise((resolve, reject) => {
      socket.emit('createTransport', { direction: 'recv' }, (res) =>
        res.error ? reject(res.error) : resolve(res)
      );
    });

    const recvTransport = device.createRecvTransport(transportParams);
    recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
      socket.emit('connectTransport', { transportId: recvTransport.id, dtlsParameters }, (res) => {
        res.error ? errback(res.error) : callback();
      });
    });

    recvTransportRef.current = recvTransport;
    return recvTransport;
  };

  const consumeProducer = async (socket, producerInfo, device) => {
    const consumerParams = await new Promise((resolve, reject) => {
      socket.emit('consumeProducer', {
        transportId: recvTransportRef.current.id,
        producerId: producerInfo.id,
        rtpCapabilities: device.rtpCapabilities,
      }, (res) =>
        res.error ? reject(res.error) : resolve(res)
      );
    });

    const consumer = await recvTransportRef.current.consume({
      id: consumerParams.id,
      producerId: producerInfo.id,
      kind: consumerParams.kind,
      rtpParameters: consumerParams.rtpParameters,
    });

    consumer.on('transportclose', () => handleConsumerClosed(consumer.id));
    consumer.on('trackended', () => handleConsumerClosed(consumer.id));

    consumersRef.current.set(consumer.id, consumer);
    await consumer.resume();

    setRemoteStream((prev) => {
      const stream = new MediaStream();
      if (prev) prev.getTracks().forEach(t => stream.addTrack(t));
      const alreadyExists = stream.getTracks().some(t => t.id === consumer.track.id);
      if (!alreadyExists) stream.addTrack(consumer.track);
      return stream;
    });
  };

  const handleProducerClosed = (producerId) => {
    const toRemove = [];
    consumersRef.current.forEach((c, id) => {
      if (c.producerId === producerId) {
        c.close();
        toRemove.push(id);
      }
    });
    toRemove.forEach(id => consumersRef.current.delete(id));
    setRemoteStream(null);
  };

  const handleConsumerClosed = (consumerId) => {
    const consumer = consumersRef.current.get(consumerId);
    if (!consumer) return;
    consumer.close();
    consumersRef.current.delete(consumerId);
    setRemoteStream(prev => {
      if (!prev) return null;
      const newStream = new MediaStream();
      prev.getTracks().forEach(track => {
        if (track.id !== consumer.track.id) newStream.addTrack(track);
      });
      return newStream.getTracks().length > 0 ? newStream : null;
    });
  };

  const cleanup = () => {
    consumersRef.current.forEach(c => c.close());
    consumersRef.current.clear();
    recvTransportRef.current?.close();
    recvTransportRef.current = null;
    remoteStream?.getTracks().forEach(track => track.stop());
    socketRef.current?.disconnect();
    socketRef.current = null;
  };

  const handleReconnect = async () => {
    cleanup();
    connectionAttemptsRef.current = 0;
    setConnectionStatus('connecting');
    setError(null);
    setJoinedRoom(false);
    connectToServer(roomId);
  };

  return {
    remoteStream,
    connectionStatus,
    error,
    socket: socketRef.current,
    joinedRoom,
    handleReconnect,
  };
};
