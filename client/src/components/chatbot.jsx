// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const { GoogleGenerativeAI } = require('@google/generative-ai');

// // Initialize Gemini AI
// const genAI = new GoogleGenerativeAI('AIzaSyArd9Zl_PFShLA-Q_-Xp0624mMGLk0JMgQ');
// const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// const app = express();

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());

// // Store chat history (in a real app, you'd use a database)
// let chatHistory = [];

// // Routes
// app.get('/api/messages', (req, res) => {
//   res.json(chatHistory);
// });

// app.post('/api/messages', async (req, res) => {
//   try {
//     const { message } = req.body;

//     // Save user message
//     const userMessage = {
//       id: chatHistory.length + 1,
//       type: 'user',
//       content: message,
//       timestamp: new Date().toLocaleTimeString(),
//     };
//     chatHistory.push(userMessage);

//     try {
//       // Generate response using Gemini
//       const result = await model.generateContent(message);
//       const response = await result.response;
//       const botResponse = response.text();

//       // Create bot message
//       const botMessage = {
//         id: chatHistory.length + 1,
//         type: 'bot',
//         content: botResponse,
//         timestamp: new Date().toLocaleTimeString(),
//       };
//       chatHistory.push(botMessage);

//       res.json(botMessage);
//     } catch (aiError) {
//       console.error('AI Error:', aiError);
//       // Send a fallback message if AI fails
//       const fallbackMessage = {
//         id: chatHistory.length + 1,
//         type: 'bot',
//         content:
//           "I apologize, but I'm having trouble processing your request at the moment. Could you please try again?",
//         timestamp: new Date().toLocaleTimeString(),
//       };
//       chatHistory.push(fallbackMessage);
//       res.json(fallbackMessage);
//     }
//   } catch (error) {
//     console.error('Server Error:', error);
//     res.status(500).json({
//       error: 'Internal server error',
//       message: error.message,
//     });
//   }
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

// --------------------------------------------------------

// import React, { useEffect, useRef, useState } from 'react';

// const ChatbotInterface = () => {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef(null);

//   // Fetch initial messages
//   useEffect(() => {
//     fetchMessages();
//   }, []);

//   const fetchMessages = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/messages');
//       const data = await response.json();
//       setMessages(data);
//     } catch (error) {
//       console.error('Error fetching messages:', error);
//     }
//   };

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!inputMessage.trim()) return;

//     setIsTyping(true);

//     try {
//       const response = await fetch('http://localhost:5000/api/messages', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ message: inputMessage }),
//       });

//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }

//       setInputMessage('');
//       // Fetch updated messages after sending
//       await fetchMessages();
//     } catch (error) {
//       console.error('Error sending message:', error);
//       alert('Failed to send message. Please try again.');
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   // Rest of the component remains the same...
//   return (
//     <div className="flex flex-col h-screen bg-white">
//       {/* Header */}
//       <div className="p-4 border-b flex items-center gap-3">
//         <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
//           <svg
//             className="w-6 h-6 text-white"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//             />
//           </svg>
//         </div>
//         <div>
//           <h1 className="font-semibold text-lg">AI Assistant</h1>
//           <p className="text-sm text-gray-500">Always here to help</p>
//         </div>
//       </div>

//       {/* Chat Area */}
//       <div className="flex-1 overflow-y-auto p-4">
//         {messages.map((message) => (
//           <div
//             key={message.id}
//             className={`flex gap-3 mb-4 ${
//               message.type === 'bot' ? 'justify-start' : 'justify-end'
//             }`}
//           >
//             {message.type === 'bot' && (
//               <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
//                 <svg
//                   className="w-5 h-5 text-white"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//                   />
//                 </svg>
//               </div>
//             )}
//             <div
//               className={`max-w-[70%] rounded-lg p-3 ${
//                 message.type === 'bot'
//                   ? 'bg-gray-100'
//                   : 'bg-blue-500 text-white'
//               }`}
//             >
//               <p className="whitespace-pre-wrap">{message.content}</p>
//               <span
//                 className={`text-xs ${
//                   message.type === 'bot' ? 'text-gray-500' : 'text-blue-100'
//                 } block mt-1`}
//               >
//                 {message.timestamp}
//               </span>
//             </div>
//             {message.type === 'user' && (
//               <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
//                 <svg
//                   className="w-5 h-5 text-white"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                   />
//                 </svg>
//               </div>
//             )}
//           </div>
//         ))}
//         {isTyping && (
//           <div className="flex items-center gap-2 text-gray-500">
//             <div className="flex gap-1">
//               <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
//               <div
//                 className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
//                 style={{ animationDelay: '0.2s' }}
//               ></div>
//               <div
//                 className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
//                 style={{ animationDelay: '0.4s' }}
//               ></div>
//             </div>
//             <span className="text-sm">AI is typing...</span>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Area */}
//       <form onSubmit={handleSubmit} className="p-4 border-t">
//         <div className="flex gap-2">
//           <input
//             type="text"
//             value={inputMessage}
//             onChange={(e) => setInputMessage(e.target.value)}
//             placeholder="Type your message..."
//             className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
//           />
//           <button
//             type="submit"
//             className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
//           >
//             <svg
//               className="w-5 h-5"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
//               />
//             </svg>
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default ChatbotInterface;
