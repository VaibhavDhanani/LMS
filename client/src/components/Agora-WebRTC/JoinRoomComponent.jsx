// import React, { useState, useEffect, useRef } from 'react';
// import AgoraRTC from 'agora-rtc-sdk-ng';

// const JoinRoomComponent = () => {
//   const [client, setClient] = useState(null);
//   const [localTracks, setLocalTracks] = useState([]);
//   const [remoteUsers, setRemoteUsers] = useState({});

//   const localVideoRef = useRef(null);

//   useEffect(() => {
//     const joinRoom = async () => {
//       const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
//       await client.join(APP_ID, getRoomId(), null, sessionStorage.getItem('uid'));
//       setClient(client);

//       client.on('user-published', handleUserPublished);
//       client.on('user-left', handleUserLeft);

//       await joinStream();
//     };

//     joinRoom();
//   }, []);

//   const getRoomId = () => {
//     const queryString = window.location.search;
//     const urlParams = new URLSearchParams(queryString);
//     return urlParams.get('room') || 'main';
//   };

//   const joinStream = async () => {
//     document.getElementById('join-btn').style.display = 'none';
//     document.getElementsByClassName('stream__actions')[0].style.display = 'flex';

//     const tracks = await AgoraRTC.createMicrophoneAndCameraTracks({}, {
//       encoderConfig: {
//         width: { min: 640, ideal: 1920, max: 1920 },
//         height: { min: 480, ideal: 1080, max: 1080 }
//       }
//     });
//     setLocalTracks(tracks);

//     const player = `<div class="video__container" id="user-container-${sessionStorage.getItem('uid')}">
//                       <div class="video-player" id="user-${sessionStorage.getItem('uid')}"></div>
//                     </div>`;
//     document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
//     document.getElementById(`user-container-${sessionStorage.getItem('uid')}`).addEventListener('click', expandVideoFrame);

//     tracks[1].play(`user-${sessionStorage.getItem('uid')}`);
//     await client.publish([tracks[0], tracks[1]]);
//   };

//   const handleUserPublished = async (user, mediaType) => {
//     remoteUsers[user.uid] = user;

//     await client.subscribe(user, mediaType);

//     let player = document.getElementById(`user-container-${user.uid}`);
//     if (player === null) {
//       player = `<div class="video__container" id="user-container-${user.uid}">
//                   <div class="video-player" id="user-${user.uid}"></div>
//               </div>`;
//       document.getElementById('streams__container').insertAdjacentHTML('beforeend', player);
//       document.getElementById(`user-container-${user.uid}`).addEventListener('click', expandVideoFrame);
//     }

//     if (mediaType === 'video') {
//       user.videoTrack.play(`user-${user.uid}`);
//     }

//     if (mediaType === 'audio') {
//       user.audioTrack.play();
//     }
//   };

//   const handleUserLeft = async (user) => {
//     delete remoteUsers[user.uid];
//     const item = document.getElementById(`user-container-${user.uid}`);
//     if (item) {
//       item.remove();
//     }
//     // Handle display frame update
//   };

//   return (
//     <div>
//       <button id="join-btn" onClick={joinStream}>Join Room</button>
//       <div className="stream__actions" style={{ display: 'none' }}>
//         <button id="camera-btn" onClick={toggleCamera}>Camera</button>
//         <button id="mic-btn" onClick={toggleMic}>Mic</button>
//         <button id="screen-btn" onClick={toggleScreen}>Screen</button>
//         <button id="leave-btn" onClick={leaveStream}>Leave</button>
//       </div>
//       <div id="streams__container"></div>
//     </div>
//   );
// };

// export default JoinRoomComponent;