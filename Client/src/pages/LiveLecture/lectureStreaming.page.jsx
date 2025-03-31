import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { Device } from "mediasoup-client";
import { getRoomToken, endLecture } from '../../services/lecture.service';
import { useAuth } from "@/context/AuthContext";
import { Video, VideoOff, Mic, MicOff, Play, PhoneOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import LectureChat from "@/components/LiveLecture/LectureChat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
const SocketURL = import.meta.env.VITE_SOCKET_URL;

const LectureStreaming = () => {
  const [device, setDevice] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [roomId, setRoomId] = useState('');
  const [socket, setSocket] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const videoProducerRef = useRef(null);
  const audioProducerRef = useRef(null);
  const streamRef = useRef(null);
  const socketRef = useRef(null);  
  const roomTokenRef = useRef(null);
  
  const navigate = useNavigate();
  const { id } = useParams();
  const {  token } = useAuth();

  useEffect(() => {
    const initLecture = async () => {
      try {
        const response = await getRoomToken(id, token);
        const roomToken = response.data.roomToken;
        setRoomId(roomToken);
        roomTokenRef.current = roomToken;
  
        // console.log(SocketURL);  
        const newSocket = io(SocketURL);
        setSocket(newSocket);
        socketRef.current = newSocket;
  
        newSocket.on("connect", () => {
          console.log("Socket connected:", newSocket.id);
  
          // Emit an event to create the room
          setupDevice(newSocket);
          newSocket.emit("createRoom", { roomId: roomToken }, (ack) => {
            if (ack.success) {
              console.log("Room created successfully:", roomToken);
            } else {
              console.error("Error creating room:", ack.error);
            }
          });
        });
  
        return () => {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
          }
          newSocket.disconnect();
        };
      } catch (error) {
        console.error("Error fetching room ID:", error);
      }
    };
  
    initLecture();
  }, []);
  

  async function setupDevice(socket) {
    try {
      if (!socket) {
        console.error('Socket is not initialized');
        return;
      }

      const rtpCapabilities = await new Promise((resolve, reject) => {
        socket.emit('getRtpCapabilities', (response) => {
          if (response.error) {
            reject(response.error);
          } else {
            resolve(response.rtpCapabilities);
          }
        });
      });

      const newDevice = new Device();
      await newDevice.load({ routerRtpCapabilities: rtpCapabilities });

      setDevice(newDevice);
      console.log('Device loaded successfully:', newDevice);
    } catch (error) {
      console.error('Error setting up device:', error);
    }
  }

  async function startStreaming() {
    if (!roomId || !socket || !device) {
      console.error('Missing required components');
      return;
    }

    try {
      const transportParams = await new Promise((resolve, reject) => {
        socket.emit('createTransport', { direction: 'send', roomId }, (response) => {
          if (response.error) reject(response.error);
          else resolve(response.transportParams);
        });
      });

      const sendTransport = device.createSendTransport(transportParams);

      sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
        try {
          socket.emit('connectTransport', { transportId: sendTransport.id, dtlsParameters }, (response) => {
            if (response.error) errback(response.error);
            else callback();
          });
        } catch (error) {
          errback(error);
        }
      });

      sendTransport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
        try {
          socket.emit(
            'produce',
            { roomId, transportId: sendTransport.id, kind, rtpParameters },
            (response) => {
              if (response.error) errback(response.error);
              else callback({ id: response.producerId });
            }
          );
        } catch (error) {
          errback(error);
        }
      });

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setLocalStream(stream);

      const videoElement = document.getElementById('local-video');
      videoElement.srcObject = stream;

      
      const videoTrack = stream.getVideoTracks()[0];
      videoProducerRef.current = await sendTransport.produce({ track: videoTrack });
      
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioProducerRef.current = await sendTransport.produce({ track: audioTrack });
      }

      setIsStreaming(true);
    } catch (error) {
      console.error('Error during streaming:', error);
    }
  }

  const stopStreaming = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsStreaming(false);
  };

  const handleEndCall = () => {
    setShowEndConfirmation(true);
  };

  const confirmEndLecture = async () => {
    try {
      stopStreaming();
      
      socketRef.current.emit("endLecture", { roomId: roomTokenRef.current });
      socketRef.current.disconnect();
      
      const response = await endLecture(id,token);
      setShowEndConfirmation(false);
      if(response.success){
        toast.success("Lecture completed successfully!");
        navigate("/livelectures/section");
      }else{
        toast.error("Failed to end lecture. Please try again.");
        setShowEndConfirmation(false);
      }
      
    } catch (error) {
      console.error("Error ending lecture:", error);
      toast.error("Failed to end lecture. Please try again.");
      setShowEndConfirmation(false);
    }
  };

  const cancelEndLecture = () => {
    setShowEndConfirmation(false);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto pt-24">
      <h2 className="text-2xl font-bold mb-4">Lecture Room</h2>
      <div className="relative rounded-lg overflow-hidden bg-gray-100">
        <video
          id="local-video"
          className="w-full aspect-video bg-black"
          autoPlay
          playsInline
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <Button
            onClick={isStreaming ? handleEndCall : startStreaming}
            variant="secondary"
            className={isStreaming ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"}
          >
            {isStreaming ? (
              <PhoneOff className="h-5 w-5" /> // End Call Icon
            ) : (
              <Play className="h-5 w-5" /> // Start Lecture Icon
            )}
          </Button>
          <Button
            onClick={toggleVideo}
            variant="secondary"
            className="bg-white/90 hover:bg-white"
            disabled={!isStreaming}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          <Button
            onClick={toggleAudio}
            variant="secondary"
            className="bg-white/90 hover:bg-white"
            disabled={!isStreaming}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      {socketRef.current && roomTokenRef.current && (
        <LectureChat 
          socket={socketRef.current} 
          roomId={roomTokenRef.current} 
          isHost={true} // Consumer is not the host
        />
      )}

      {/* End Lecture Confirmation Dialog */}
      <Dialog open={showEndConfirmation} onOpenChange={setShowEndConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>End Lecture</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Are you sure you want to end this lecture? This action cannot be undone.</p>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={cancelEndLecture}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmEndLecture}>
              End Lecture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LectureStreaming;