import React, { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import { fetchMessages, sendMessage } from "@/services/chat.service";
import { useAuth } from "@/context/AuthContext";

const ChatbotInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const {token} = useAuth();

  const loadMessages = async () => {
    try {
      const data = await fetchMessages(token);
      setMessages(data);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [token]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    // Optimistically add user message to the UI
    const userMessage = {
      id: messages.length ? messages[messages.length - 1].id + 1 : 1,
      type: "user",
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      // Send message to backend
      await sendMessage(inputMessage,token);
      await loadMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      // If there's an error, add a fallback bot message
      const fallbackMessage = {
        id: userMessage.id + 1,
        type: "bot",
        content:
          "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prevMessages) => [...prevMessages, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const processMarkdown = (text) => {
    try {
      return marked(text);
    } catch (error) {
      console.error("Error processing markdown:", error);
      return text;
    }
  };

  const MessageContent = ({ content }) => (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: processMarkdown(content || " ") }}
    />
  );

  // console.dir(messages);
  const chatMessages = messages.length > 0 ? messages[0].messages : [];

  return (
    <div className="flex flex-col max-h-screen bg-white ml-3">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h1 className="font-semibold text-lg">Gemini AI Assistant</h1>
          <p className="text-sm text-gray-500">Powered by Google Gemini</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {chatMessages &&
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 mb-4 ${
                message.type === "bot" ? "justify-start" : "justify-end"
              }`}
            >
              {message.type === "bot" && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.type === "bot"
                    ? "bg-gray-100"
                    : "bg-blue-500 text-white"
                }`}
              >
                <MessageContent content={message.content} />
                <span
                  className={`text-xs ${
                    message.type === "bot" ? "text-gray-500" : "text-blue-100"
                  } block mt-1`}
                >
                  {new Date(message.timestamp).toLocaleString("en-US", {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              {message.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        {isTyping && (
          <div className="flex items-center gap-2 text-gray-500">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
              <div
                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: "0.2s" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                style={{ animationDelay: "0.4s" }}
              ></div>
            </div>
            <span className="text-sm">AI is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            disabled={isTyping}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatbotInterface;
