import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ChevronRight, ChevronLeft, MessageSquare } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LectureChat = ({ socket, roomId, isHost = false }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (!socket) return;

    socket.on('chatMessage', (message) => {
      setMessages(prevMessages => [...prevMessages, message]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, [socket]);

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

    socket.emit('sendChatMessage', messageData, (response) => {
      if (response?.error) {
        console.error('Error sending message:', response.error);
      } else {
        setMessages(prevMessages => [...prevMessages, messageData]);
        setNewMessage('');
      }
    });
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className={`fixed right-0 top-16 bottom-24 bg-white border-l transition-all duration-300 flex flex-col
        ${isExpanded ? 'w-80 lg:w-96' : 'w-12'}`}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -left-10 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-l-lg shadow-md hover:bg-primary/90 transition-colors"
      >
        {isExpanded ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
      </button>

      {/* Chat header */}
      <div className="flex items-center px-4 py-3 bg-primary text-white">
        <MessageSquare className="h-5 w-5 mr-2" />
        {isExpanded && <h3 className="font-medium">Lecture Chat</h3>}
      </div>

      {isExpanded && (
        <>
          {/* Messages area */}
          <div className="flex-1 p-4 flex flex-col gap-3 bg-slate-50 overflow-y-auto">
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
          <form onSubmit={sendMessage} className="p-3 border-t bg-white flex gap-2">
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