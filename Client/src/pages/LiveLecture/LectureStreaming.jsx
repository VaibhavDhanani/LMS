// components/LectureStreaming.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useLectureSocket } from "@/hooks/useLectureSocket";
import { useAuth } from "@/context/AuthContext";
import { endLecture } from "@/services/lecture.service";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import LectureChat from "@/components/LiveLecture/LectureChat";
import { Video, VideoOff, Mic, MicOff, Play, PhoneOff } from "lucide-react";

const LectureStreaming = () => {
  const { id: roomId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [showEndConfirmation, setShowEndConfirmation] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const {
    socket,
    localStream,
    isStreaming,
    startStreaming,
    stopStreaming,
    endLecture: emitEndLecture,
  } = useLectureSocket(roomId, handleLectureEnd);

  function handleLectureEnd() {
    toast.warn("Lecture has ended.");
    navigate("/livelecture/section");
  }

  const confirmEndLecture = async () => {
    try {
      emitEndLecture();
      const res = await endLecture(roomId, token);
      setShowEndConfirmation(false);
      res.success ? toast.success("Lecture ended!") : toast.error("Failed to end lecture.");
    } catch (e) {
      toast.error("Something went wrong");
    }
  };

  const toggleVideo = () => {
    const track = localStream?.getVideoTracks()[0];
    if (track) {
      track.enabled = !isVideoEnabled;
      setIsVideoEnabled(track.enabled);
    }
  };

  const toggleAudio = () => {
    const track = localStream?.getAudioTracks()[0];
    if (track) {
      track.enabled = !isAudioEnabled;
      setIsAudioEnabled(track.enabled);
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
          muted
          ref={(video) => {
            if (video && localStream) video.srcObject = localStream;
          }}
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          <Button
            onClick={isStreaming ? () => setShowEndConfirmation(true) : startStreaming}
            className={isStreaming ? "bg-red-600 text-white" : "bg-green-600 text-white"}
          >
            {isStreaming ? <PhoneOff className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          <Button onClick={toggleVideo} disabled={!isStreaming}>
            {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </Button>
          <Button onClick={toggleAudio} disabled={!isStreaming}>
            {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {socket && (
        <LectureChat socket={socket} roomId={roomId} isHost={true} />
      )}

      <Dialog open={showEndConfirmation} onOpenChange={setShowEndConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Lecture?</DialogTitle>
          </DialogHeader>
          <p>This action will end the lecture for everyone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEndConfirmation(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmEndLecture}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LectureStreaming;
