import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import { Device } from "mediasoup-client";

const socket = io("http://localhost:3000");

const LectureRoom1 = () => {
  const [device, setDevice] = useState(null);
  const [producerTransport, setProducerTransport] = useState(null);
  const [consumerTransport, setConsumerTransport] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    // Handle socket connection status
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    return () => {
      if (producerTransport) producerTransport.close();
      if (consumerTransport) consumerTransport.close();
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    console.log("Device initialized:", device);
  }, [device]);

  useEffect(() => {
    console.log("Producer Transport:", producerTransport);
    console.log("Consumer Transport:", consumerTransport);
  }, [producerTransport, consumerTransport]);

  useEffect(() => {
    console.log("Socket connection status:", isConnected ? "Connected" : "Disconnected");
  }, [isConnected]);

  useEffect(() => {
    const initMediasoup = async () => {
      try {
        const rtpCapabilities = await new Promise((resolve) => {
          socket.emit("get-rtp-capabilities", resolve);
        });

        const device = new Device();
        await device.load({ routerRtpCapabilities: rtpCapabilities });
        setDevice(device);
        console.log("Mediasoup device initialized:", device.loaded);
      } catch (error) {
        console.error("Failed to initialize mediasoup device:", error);
      }
    };

    if (isConnected) {
      initMediasoup();
    }
  }, [isConnected]);

  const createLecture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Produce both video and audio tracks
      const tracks = stream.getTracks();
      for (const track of tracks) {
        try {
          const producer = await transport.produce({ track });
          console.log(`${track.kind} producer created:`, producer.id);
        } catch (error) {
          console.error(`Failed to produce ${track.kind}:`, error);
        }
      }
    } catch (error) {
      console.error("Failed to create lecture:", error);
    }
  };

  const joinLecture = async () => {
    try {
      const transportOptions = await new Promise((resolve) => {
        socket.emit("create-consumer-transport", resolve);
      });

      const transport = device.createRecvTransport(transportOptions);
      setConsumerTransport(transport);

      transport.on("connect", async ({ dtlsParameters }, callback, errback) => {
        try {
          await new Promise((resolve, reject) => {
            socket.emit("connect-transport", { dtlsParameters }, (response) => {
              if (response.error) {
                reject(response.error);
              } else {
                resolve(response);
              }
            });
          });
          callback();
        } catch (error) {
          console.error("Failed to connect consumer transport:", error);
          errback(error);
        }
      });

      // Request existing producers when joining
      socket.emit("get-producers", async (producers) => {
        for (const { producerId, kind } of producers) {
          await consumeTrack(transport, producerId, kind);
        }
      });

      // Handle new producers
      socket.on("new-producer", async ({ producerId, kind }) => {
        await consumeTrack(transport, producerId, kind);
      });

    } catch (error) {
      console.error("Failed to join lecture:", error);
    }
  };

  const consumeTrack = async (transport, producerId, kind) => {
    try {
      const consumerOptions = await new Promise((resolve) => {
        console.log("Requesting to consume track for producer:", producerId);
        socket.emit("consume", {
          producerId,
          rtpCapabilities: device.rtpCapabilities,
        }, resolve);
      });

      const consumer = await transport.consume(consumerOptions);
      console.log(`Consumer created: ${consumer.id}`, consumer);

      // Check if consumer track is valid
      if (consumer.track) {
        console.log("Consumer track:", consumer.track);
      } else {
        console.error("Consumer track is not valid.");
      }

      const remoteStream = new MediaStream([consumer.track]);
      console.log("Remote Stream:", remoteStream);

      if (remoteVideoRef.current) {
        if (kind === "video") {
          remoteVideoRef.current.srcObject = remoteStream;
        } else {
          const existingStream = remoteVideoRef.current.srcObject;
          if (existingStream) {
            existingStream.addTrack(consumer.track);
          } else {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        }
      }

      // Check if tracks are available
      console.log("Remote Video tracks:", remoteVideoRef.current.srcObject.getTracks());
      if (!remoteVideoRef.current) {
        console.error("Remote video reference is not initialized.");
        return;
      }
      
      await consumer.resume();
      console.log(`${kind} consumer created and resumed:`, consumer.id);
    } catch (error) {
      console.error("Failed to consume track:", error);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 space-x-4">
        <button 
          onClick={joinLecture}
          disabled={!device || !isConnected}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Join Lecture
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
     
        <div>
          <h3 className="mb-2">Remote Video</h3>
          <video 
            ref={remoteVideoRef}
            autoPlay 
            playsInline 
            className="w-full bg-black"
          />
        </div>
      </div>
    </div>
  );
};

export default LectureRoom1;
