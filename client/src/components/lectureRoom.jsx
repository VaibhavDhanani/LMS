import React, { useRef, useState, useEffect } from "react";
import io from "socket.io-client";
import { Device } from "mediasoup-client";

const socket = io("http://localhost:3000");

const LectureRoom = () => {
  const [device, setDevice] = useState(null);
  const [producerTransport, setProducerTransport] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const localVideoRef = useRef(null);

  useEffect(() => {
    // Handle socket connection status
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    return () => {
      if (producerTransport) producerTransport.close();
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    console.log("Device initialized:", device);
  }, [device]);

  useEffect(() => {
    console.log("Producer Transport:", producerTransport);
  }, [producerTransport]);

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

      const transportOptions = await new Promise((resolve) => {
        socket.emit("create-producer-transport", resolve);
      });

      const transport = device.createSendTransport(transportOptions);
      setProducerTransport(transport);

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
          console.error("Failed to connect transport:", error);
          errback(error);
        }
      });

      transport.on("produce", async ({ kind, rtpParameters }, callback, errback) => {
        try {
          const { id } = await new Promise((resolve, reject) => {
            socket.emit("produce", { kind, rtpParameters }, (response) => {
              if (response.error) {
                reject(response.error);
              } else {
                resolve(response);
              }
            });
          });
          callback({ id });
        } catch (error) {
          console.error("Failed to produce:", error);
          errback(error);
        }
      });

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


  return (
    <div className="p-4">
      <div className="mb-4 space-x-4">
        <button 
          onClick={createLecture}
          disabled={!device || !isConnected}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          Start Lecture
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="mb-2">Local Video</h3>
          <video 
  ref={localVideoRef}
  autoPlay 
  playsInline 
  muted 
  onError={(e) => console.error("Local video playback error:", e)}
  className="w-full bg-black"
/>

        </div>
      </div>
    </div>
  );
};

export default LectureRoom;
