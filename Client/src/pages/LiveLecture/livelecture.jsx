import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from "react-toastify";
import { Loader2 } from 'lucide-react';
import { useLiveLectureConsumer } from '@/hooks/useLiveLectureConsumer';
import LectureChat from '@/components/LiveLecture/LectureChat';

const LiveLecture = () => {
  const { id: roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const {
    remoteStream,
    connectionStatus,
    error,
    socket,
    joinedRoom,
    handleReconnect,
  } = useLiveLectureConsumer({
    roomId,
    user,
    onLectureEnded: () => {
      toast.info("Lecture has ended.");
      navigate("/livelecture/section");
    },
  });

  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const renderContent = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <StatusCard icon={<Loader2 className="animate-spin" />} text="Connecting to lecture room..." />;
      case 'waiting':
        return (
          <StatusCard icon={<Loader2 className="animate-spin text-blue-500" />} text={
            joinedRoom
              ? "Waiting for the host to start sharing..."
              : "Waiting to join lecture..."
          } />
        );
      case 'error':
        return (
          <StatusCard
            icon={null}
            text={error || "Connection error"}
            error
            action={<button onClick={handleReconnect} className="px-4 py-2 bg-primary text-white rounded">Try Again</button>}
          />
        );
      case 'connected':
      case 'reconnecting':
        return (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              controls
              className="w-full max-w-2xl mx-auto bg-black rounded-lg"
              style={{ minHeight: '300px' }}
            />
            {connectionStatus === 'reconnecting' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <StatusCard icon={<Loader2 className="animate-spin" />} text="Reconnecting..." />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 flex flex-col items-center pt-24">
      <h2 className="text-xl font-bold mb-4">Live Lecture Stream</h2>
      <div className="w-full max-w-2xl">{renderContent()}</div>
      {socket && <LectureChat socket={socket} roomId={roomId} isHost={false} />}
    </div>
  );
};

const StatusCard = ({ icon, text, error, action }) => (
  <div className={`flex flex-col items-center justify-center h-64 rounded-lg ${error ? 'bg-red-100 border border-red-300' : 'bg-gray-100'}`}>
    {icon && <div className="mb-4">{icon}</div>}
    <p className={`text-lg font-medium ${error ? 'text-red-600' : ''}`}>{text}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default LiveLecture;
