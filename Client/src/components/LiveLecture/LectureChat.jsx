import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, X, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LectureChat = ({ socket, roomId, isHost = false }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  
  // Handle receiving messages
  useEffect(() => {
    if (!socket) return;

    // Listen for incoming chat messages
    socket.on('chatMessage', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Clean up event listener
    return () => {
      socket.off('chatMessage');
    };
  }, [socket]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    
    if (!socket || !newMessage.trim() || !roomId) return;

    const messageData = {
      roomId,
      senderId: user?.id || 'anonymous',
      senderName: user?.email || 'Anonymous',
      message: newMessage.trim(),
      timestamp: new Date().toISOString(),
      isHost: isHost
    };

    // Emit the message to the server
    socket.emit('sendChatMessage', messageData, (response) => {
      if (response?.error) {
        console.error('Error sending message:', response.error);
      } else {
        // Add the message to local state
        setMessages(prevMessages => [...prevMessages, messageData]);
        // Clear the input field
        setNewMessage('');
      }
    });
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Format timestamp to a readable time
  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`fixed right-4 bottom-4 ${isOpen ? 'w-80 sm:w-96' : 'w-auto'} transition-all duration-300 bg-white rounded-lg shadow-lg border overflow-hidden z-10`}>
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-2 bg-primary text-white">
        <h3 className="font-medium flex items-center">
          <MessageSquare className="h-4 w-4 mr-2" />
          Lecture Chat
        </h3>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleChat} className="h-8 w-8 text-white hover:bg-primary-dark">
            {isOpen ? <X className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {isOpen && (
        <>
          {/* Messages area - using standard div with overflow instead of ScrollArea */}
          <div className="h-64 p-4 flex flex-col gap-3 bg-slate-50 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 my-10">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index}
                  className={`flex flex-col max-w-[85%] ${msg.senderId === user?.id ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-medium text-gray-600">
                      {msg.senderName} {msg.isHost && '(host)'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <div 
                    className={`rounded-lg px-3 py-2 break-words ${
                      msg.senderId === user?.id 
                        ? 'bg-primary text-white' 
                        : msg.isHost 
                          ? 'bg-amber-100 border border-amber-200' 
                          : 'bg-gray-200'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          <form onSubmit={sendMessage} className="p-3 border-t flex gap-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </>
      )}
      
    </div>
  );
};

export default LectureChat;