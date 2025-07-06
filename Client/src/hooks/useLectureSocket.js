// hooks/useLectureSocket.js
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { Device } from 'mediasoup-client';

const SocketURL = import.meta.env.VITE_SOCKET_URL;

export function useLectureSocket(roomId, onLectureEnded) {
  const [socket, setSocket] = useState(null);
  const [device, setDevice] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [participants, setParticipants] = useState([]);

  const socketRef = useRef(null);
  const streamRef = useRef(null);
  const sendTransportRef = useRef(null);

  useEffect(() => {
    const socketInstance = io(SocketURL);
    setSocket(socketInstance);
    socketRef.current = socketInstance;

    socketInstance.on("connect", () => {
      socketInstance.emit("createRoom", { roomId }, () => {});
      setupDevice(socketInstance);
    });

    socketInstance.on("lectureEnded", onLectureEnded);

    // 🔔 New user joined
    socketInstance.on("userJoined", ({ user }) => {
      console.log("New user joined:", user);
      setParticipants((prev) => {
        const exists = prev.some((p) => p.socketId === user.socketId);
        return exists ? prev : [...prev, user];
      });
    });

    // 🔁 Entire participant list updated
    socketInstance.on("updateParticipantList", ({ participants }) => {
      console.log("Updated participant list:", participants);
      setParticipants(participants);
    });

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      socketInstance.disconnect();
    };
  }, [roomId]);

  const setupDevice = async (socket) => {
    const { rtpCapabilities } = await new Promise((resolve, reject) => {
      socket.emit("getRtpCapabilities", (res) => {
        res.error ? reject(res.error) : resolve(res);
      });
    });

    const newDevice = new Device();
    await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
    setDevice(newDevice);
  };

  const startStreaming = async () => {
    if (!device || !socketRef.current) return;

    const { transportParams } = await new Promise((resolve, reject) => {
      socketRef.current.emit("createTransport", { direction: 'send', roomId }, (res) =>
        res.error ? reject(res.error) : resolve(res)
      );
    });

    const sendTransport = device.createSendTransport(transportParams);
    sendTransportRef.current = sendTransport;

    sendTransport.on("connect", ({ dtlsParameters }, callback, errback) => {
      socketRef.current.emit("connectTransport", { transportId: sendTransport.id, dtlsParameters }, (res) => {
        res.error ? errback(res.error) : callback();
      });
    });

    sendTransport.on("produce", ({ kind, rtpParameters }, callback, errback) => {
      socketRef.current.emit(
        "produce",
        { roomId, transportId: sendTransport.id, kind, rtpParameters },
        (res) => {
          res.error ? errback(res.error) : callback({ id: res.producerId });
        }
      );
    });

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    setLocalStream(stream);

    await sendTransport.produce({ track: stream.getVideoTracks()[0] });
    await sendTransport.produce({ track: stream.getAudioTracks()[0] });

    setIsStreaming(true);
  };

  const stopStreaming = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsStreaming(false);
  };

  const endLecture = () => {
    stopStreaming();
    socketRef.current.emit("endLecture", { roomId });
  };

  return {
    socket,
    isStreaming,
    localStream,
    participants,
    startStreaming,
    stopStreaming,
    endLecture,
  };
}
