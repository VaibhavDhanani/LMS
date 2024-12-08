import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import { Device } from "mediasoup-client";

const socket = io("http://localhost:3000");

const LectureRoom = () => {
  const [device, setDevice] = useState(null);
  const [producerTransport, setProducerTransport] = useState(null);
  const [consumerTransport, setConsumerTransport] = useState(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  useEffect(() => {
    return () => {
      if (producerTransport) producerTransport.close();
      if (consumerTransport) consumerTransport.close();
    };
  }, []);
  
  useEffect(() => {
    const initMediasoup = async () => {
      const rtpCapabilities = await new Promise((resolve) => {
        socket.emit("get-rtp-capabilities", resolve);
      });

      const device = new Device();
      await device.load({ routerRtpCapabilities: rtpCapabilities });
      setDevice(device);
    };

    initMediasoup();
  }, []);

  const createLecture = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

    const transportOptions = await new Promise((resolve) => {
      socket.emit("create-producer-transport", resolve);
    });

    const transport = device.createSendTransport(transportOptions);
    setProducerTransport(transport);
    transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
      try {
        await new Promise((resolve) => {
          socket.emit("connect-transport", { dtlsParameters }, resolve);
        });
        callback(); // Notify success.
      } catch (error) {
        errback(error); // Notify failure.
      }
    });
    

    transport.on("produce", ({ kind, rtpParameters }, callback) => {
      socket.emit("produce", { kind, rtpParameters }, callback);
    });

    stream.getTracks().forEach((track) => {
      transport.produce({ track });
    });
  };

  const joinLecture = async () => {
    const transportOptions = await new Promise((resolve) => {
      socket.emit("create-consumer-transport", resolve);
    });

    const transport = device.createRecvTransport(transportOptions);
    setConsumerTransport(transport);
    console.log(transport);
    transport.on("connect", ({ dtlsParameters }, callback, errback) => {
      socket.emit("connect-transport", { dtlsParameters }, callback);
    });

    socket.on("new-producer", async ({ producerId, kind }) => {
      const consumerOptions = await new Promise((resolve) => {
        socket.emit("consume", {
          producerId,
          rtpCapabilities: device.rtpCapabilities,
        }, resolve);
      });

      const consumer = await transport.consume(consumerOptions);
      const remoteStream = new MediaStream([consumer.track]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });
  };

  return (
    <div>
      <button onClick={createLecture}>Start Lecture</button>
      <button onClick={joinLecture}>Join Lecture</button>
      <video ref={localVideoRef} autoPlay playsInline muted />
      <video ref={remoteVideoRef} autoPlay playsInline />
    </div>
  );
};

export default LectureRoom;
