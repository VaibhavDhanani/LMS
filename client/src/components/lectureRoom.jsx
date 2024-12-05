import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:8000');

function LectureRoom() {
  const [lectureId, setLectureId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [error, setError] = useState(null);

  // Create lecture room
  const createLecture = () => {
    socket.emit('create-lecture', {
      title: 'Demo Lecture',
      subject: 'Introduction to WebRTC'
    });

    setIsHost(true);
  };

  // Join lecture room
  const joinLecture = () => {
    const inputLectureId = prompt('Enter Lecture ID:');
    if (inputLectureId) {
      socket.emit('join-lecture', inputLectureId);
    }
  };

  // Leave lecture room
  const leaveLecture = () => {
    if (lectureId) {
      socket.emit('leave-lecture', lectureId);
      setLectureId(null);
      setIsHost(false);
      setParticipants(0);
    }
  };

  // Socket event listeners
  useEffect(() => {
    // Lecture creation success
    socket.on('lecture-created', (data) => {
      setLectureId(data.lectureId);
      setParticipants(1);
      alert(`Lecture created! Lecture ID: ${data.lectureId}`);
    });

    // Join lecture success
    socket.on('join-lecture-success', (data) => {
      setLectureId(data.lectureId);
      setParticipants(data.totalParticipants);
      alert(`Joined lecture: ${data.lectureId}`);
    });

    // Join lecture error
    socket.on('join-lecture-error', (data) => {
      setError(data.message);
      alert(data.message);
    });

    // Participant joined (for host)
    socket.on('participant-joined', (data) => {
      setParticipants(data.totalParticipants);
      alert(`New participant joined. Total: ${data.totalParticipants}`);
    });

    // Participant left (for host)
    socket.on('participant-left', (data) => {
      setParticipants(data.totalParticipants);
      alert(`A participant left. Total: ${data.totalParticipants}`);
    });

    // Cleanup on component unmount
    return () => {
      socket.off('lecture-created');
      socket.off('join-lecture-success');
      socket.off('join-lecture-error');
      socket.off('participant-joined');
      socket.off('participant-left');
    };
  }, []);

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

      {error && <p style={{color: 'red'}}>{error}</p>}
    </div>
  );
}

export default LectureRoom;