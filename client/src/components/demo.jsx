import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { Device } from 'mediasoup-client';


function LectureRoom() {
  const [lectureId, setLectureId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [error, setError] = useState(null);
  const [transportOptions, setTransportOptions] = useState(null);
  const [consumerOptions, setConsumerOptions] = useState([]);
  const videoRef = useRef(null); // Reference for the host's video element
  const [peerConnection, setPeerConnection] = useState(null);
  
  const socket = io('http://localhost:8000');

  useEffect(() => {
    if (!peerConnection) {
      const pc = new RTCPeerConnection({
        iceServers: [{
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.l.twilio.com:3478",
          ],
        }],
      });
      setPeerConnection(pc);
    }
  
    return () => {
      if (peerConnection) {
        peerConnection.close();
      }
    };
  }, []);
  

  // Create lecture room
  const createLecture = async () => {
    socket.emit('create-lecture', {
      title: 'Demo Lecture',
      subject: 'Introduction to WebRTC'
    },peerConnection);
    setIsHost(true);
  };

  // Join lecture room
  const joinLecture = () => {
    const inputLectureId = prompt('Enter Lecture ID:');
    if (inputLectureId) {
      socket.emit('join-lecture', inputLectureId);
    }
  };

  // Capture the host's video stream
  const startVideoStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ // Corrected method name
        video: true,
        audio: true,
      });
      videoRef.current.srcObject = stream; // Set the video element's source to the stream

      // Emit the stream to the server
      const rtpParameters = await extractRtpParameters(stream); // Extract RTP parameters from the stream
      console.log(rtpParameters);
      socket.emit('send-producer-stream', rtpParameters);
    } catch (err) {
      console.error('Error accessing media devices.', err);
      setError('Error accessing media devices.');
    }
  };


const extractRtpParameters = async (stream) => {
  try {
    // Step 1: Fetch Router RTP Capabilities from the Server
    const routerRtpCapabilities = await fetch('http://localhost:8000/routerRtpCapabilities')
    .then((res) => res.json());
    console.log(routerRtpCapabilities);

    // Step 2: Create a Mediasoup Device
    // const device = new Device();
    // await device.load({ routerRtpCapabilities });

    // // Step 3: Create a SendTransport
    // const transportOptions = await fetch('http://localhost:8000/createTransport');
    //   // .then((res) => res.json());
    // const sendTransport = device.createSendTransport(transportOptions);

    // // Step 4: Produce from MediaStream Track and Get RTP Parameters
    // const videoTrack = stream.getVideoTracks()[0]; // Get video track
    // const producer = await sendTransport.produce({
    //   track: videoTrack, // Add the video track to the transport
    // });

    // RTP Parameters are part of the producer
    // const rtpParameters = producer.rtpParameters;

    // console.log('RTP Parameters:', rtpParameters);
    return routerRtpCapabilities;
  } catch (err) {
    console.error('Error extracting RTP parameters:', err);
    throw err;
  }
};

  // Leave lecture
  const leaveLecture = () => {
    socket.emit('leave-lecture', lectureId);
    setLectureId(null);
    setIsHost(false);
    setParticipants(0);
    setConsumerOptions([]);
    videoRef.current.srcObject = null; // Stop the video stream
  };

  // Socket event listeners
  useEffect(() => {
    socket.on('lecture-created', (data) => {
      setLectureId(data.lectureId);
      setParticipants(1);
      alert(`Lecture created! Lecture ID: ${data.lectureId}`);
      setTransportOptions(data.transportOptions);  // Save transport options for later use
      startVideoStream(); // Start the video stream after creating the lecture
    });

    socket.on('transport-options', (options) => {
      setTransportOptions(options);  // Receive transport options from server
    });

    socket.on('new-consumer', (data) => {
      setConsumerOptions((prev) => [...prev, data.consumerOptions]); // Add new consumers
    });

    socket.on('join-lecture-error', (data) => {
      setError(data.message);
      alert(data.message);
    });

    return () => {
      socket.off('lecture-created');
      socket.off('transport-options');
      socket.off('new-consumer');
      socket.off('join-lecture-error');
    };
  }, []);

  // Function to display the video streams (consumer streams)
  const renderConsumers = () => {
    return consumerOptions.map((consumer, index) => (
      <video key={index} srcObject={consumer.stream} autoPlay />
    ));
  };

  return (
    <div>
      <h1>Lecture Room</h1>

      {!lectureId ? (
        <div>
          <button onClick={createLecture}>Create Lecture</button>
          <button onClick={joinLecture}>Join Lecture</button>
        </div>
      ) : (
        <div>
          <h2>Lecture ID: {lectureId}</h2>
          <p>Participants: {participants}</p>
          
          {isHost && <p>You are the host</p>}
          
          <button onClick={leaveLecture}>Leave Lecture</button>
        </div>
      )}

      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <video ref={videoRef} autoPlay muted /> {/* Host's video stream */}
      {renderConsumers()}
    </div>
  );
}

export default LectureRoom;