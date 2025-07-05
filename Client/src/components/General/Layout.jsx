import React, { useState, useEffect } from "react";
import Navigationbar from "../Navbars/Navigationbar";
import Footer from "../Footer/Footer"; 
import { useAuth } from "@/context/AuthContext";
import ChatbotInterface from "../Extra/chatbot"; // Removed lazy loading
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';

const Layout = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const toggleChat = () => {
    if (!user) {
      toast.error('Login to chat with AI.');
      navigate("/auth"); // Redirect to login if user is not logged in
      return;
    }
    setIsChatOpen((prev) => !prev);
  };

  useEffect(() => {
    document.body.style.overflow = isChatOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isChatOpen]);

  return (
    <div className="min-h-screen flex flex-col relative">
      <Navigationbar />
      <div className="flex-1 bg-gray-100">{children}</div>
      <Footer />

      {/* Chat Button - Always Visible */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggleChat}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-5 rounded-full shadow-lg transition-all duration-300 flex items-center space-x-2 transform hover:scale-105"
        >
          {isChatOpen ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Close</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
              <span>Need Help ?</span>
            </>
          )}
        </button>
      </div>

      {/* Chat Panel - Only shows if user is logged in */}
      {isChatOpen && user && (
        <>
          <div className="fixed inset-0 bg-black transition-opacity duration-300 opacity-50 z-30" onClick={toggleChat}></div>
          <div className="fixed inset-y-0 right-0 w-full sm:w-96 md:w-1/2 lg:w-1/3 bg-white shadow-2xl z-40 transition-transform duration-300 flex flex-col">
            <div className="flex flex-col h-full pt-16">
              <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-lg">Get help from our AI Assistant</h3>
                </div>
                {/* <button onClick={toggleChat} className="text-white hover:text-gray-200 p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button> */}
              </div>
              <div className="flex-1 overflow-hidden">
                <ChatbotInterface />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;
