// import React, { useState } from 'react';

// const ChatComponent = ({ rtmClient, channel }) => {
//   const [message, setMessage] = useState('');

//   const sendMessage = async (e) => {
//     e.preventDefault();
//     await channel.sendMessage({
//       text: JSON.stringify({
//         type: 'chat',
//         message,
//         displayName: sessionStorage.getItem('display_name')
//       })
//     });
//     addMessageToDom(sessionStorage.getItem('display_name'), message);
//     setMessage('');
//   };

//   const addMessageToDom = (name, message) => {
//     const messagesWrapper = document.getElementById('messages');
//     const newMessage = `<div class="message__wrapper">
//                           <div class="message__body">
//                             <strong class="message__author">${name}</strong>
//                             <p class="message__text">${message}</p>
//                           </div>
//                         </div>`;
//     messagesWrapper.insertAdjacentHTML('beforeend', newMessage);
//     const lastMessage = document.querySelector('#messages .message__wrapper:last-child');
//     if (lastMessage) {
//       lastMessage.scrollIntoView();
//     }
//   };

//   return (
//     <form id="message__form" onSubmit={sendMessage}>
//       <input type="text" name="message" placeholder="Enter your message..." value={message} onChange={(e) => setMessage(e.target.value)} />
//       <button type="submit">Send</button>
//     </form>
//   );
// };

// export default ChatComponent;