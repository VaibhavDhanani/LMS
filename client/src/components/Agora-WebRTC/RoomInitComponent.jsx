// import React, { useState, useEffect } from 'react';
// import AgoraRTM from 'agora-rtm-sdk-ng';

// const APP_ID = "b1c8bd82341d457f883529e647b8e56a";

// const RoomInitComponent = () => {
//   const [rtmClient, setRtmClient] = useState(null);
//   const [channel, setChannel] = useState(null);

//   useEffect(() => {
//     const initRoom = async () => {
//       let uid = sessionStorage.getItem('uid');
//       if (!uid) {
//         uid = String(Math.floor(Math.random() * 10000));
//         sessionStorage.setItem('uid', uid);
//       }

//       let displayName = sessionStorage.getItem('display_name');
//       if (!displayName) {
//         window.location = 'lobby.html';
//       }

//       const client = await AgoraRTM.createInstance(APP_ID);
//       await client.login({ uid, token: null });
//       await client.addOrUpdateLocalUserAttributes({ name: displayName });

//       const roomChannel = await client.createChannel(getRoomId());
//       await roomChannel.join();

//       roomChannel.on('MemberJoined', handleMemberJoined);
//       roomChannel.on('MemberLeft', handleMemberLeft);
//       roomChannel.on('ChannelMessage', handleChannelMessage);

//       setRtmClient(client);
//       setChannel(roomChannel);

//       getMembers();
//       addBotMessageToDom(`Welcome to the room ${displayName}! 👋`);
//     };

//     initRoom();
//   }, []);

//   const getRoomId = () => {
//     const queryString = window.location.search;
//     const urlParams = new URLSearchParams(queryString);
//     return urlParams.get('room') || 'main';
//   };

//   const handleMemberJoined = async (memberId) => {
//     console.log('A new member has joined the room:', memberId);
//     addMemberToDom(memberId);

//     const members = await channel.getMembers();
//     updateMemberTotal(members);

//     const { name } = await rtmClient.getUserAttributesByKeys(memberId, ['name']);
//     addBotMessageToDom(`Welcome to the room ${name}! 👋`);
//   };

//   const addMemberToDom = async (memberId) => {
//     const { name } = await rtmClient.getUserAttributesByKeys(memberId, ['name']);
//     const membersWrapper = document.getElementById('member__list');
//     const memberItem = `<div class="member__wrapper" id="member__${memberId}__wrapper">
//                           <span class="green__icon"></span>
//                           <p class="member_name">${name}</p>
//                         </div>`;
//     membersWrapper.insertAdjacentHTML('beforeend', memberItem);
//   };

//   const updateMemberTotal = (members) => {
//     const total = document.getElementById('members__count');
//     total.innerText = members.length;
//   };

//   const handleMemberLeft = async (memberId) => {
//     removeMemberFromDom(memberId);

//     const members = await channel.getMembers();
//     updateMemberTotal(members);
//   };

//   const removeMemberFromDom = async (memberId) => {
//     const memberWrapper = document.getElementById(`member__${memberId}__wrapper`);
//     const name = memberWrapper.getElementsByClassName('member_name')[0].textContent;
//     addBotMessageToDom(`${name} has left the room.`);
//     memberWrapper.remove();
//   };

//   const getMembers = async () => {
//     const members = await channel.getMembers();
//     updateMemberTotal(members);
//     for (let i = 0; members.length > i; i++) {
//       addMemberToDom(members[i]);
//     }
//   };

//   const handleChannelMessage = (messageData, memberId) => {
//     console.log('A new message was received');
//     const data = JSON.parse(messageData.text);
//     if (data.type === 'chat') {
//       addMessageToDom(data.displayName, data.message);
//     }
//     if (data.type === 'user_left') {
//       document.getElementById(`user-container-${data.uid}`).remove();
//       // Handle display frame update
//     }
//   };

//   const addBotMessageToDom = (botMessage) => {
//     const messagesWrapper = document.getElementById('messages');
//     const newMessage = `<div class="message__wrapper">
//                           <div class="message__body__bot">
//                             <strong class="message__author__bot">🤖 Mumble Bot</strong>
//                             <p class="message__text__bot">${botMessage}</p>
//                           </div>
//                         </div>`;
//     messagesWrapper.insertAdjacentHTML('beforeend', newMessage);
//     const lastMessage = document.querySelector('#messages .message__wrapper:last-child');
//     if (lastMessage) {
//       lastMessage.scrollIntoView();
//     }
//   };

//   return null; // This component doesn't render anything, it just sets up the room
// };

// export default RoomInitComponent;