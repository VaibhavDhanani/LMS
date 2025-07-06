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
import ParticipantList from "@/components/LiveLecture/ParticipantList";

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
    participants,
  } = useLectureSocket(roomId, handleLectureEnd);

  const prevParticipantsRef = useRef([]);

  useEffect(() => {
    // Show toast when a new user joins
    const prevIds = prevParticipantsRef.current.map((p) => p.socketId);
    const newJoin = participants.find((p) => !prevIds.includes(p.socketId));
    if (newJoin) {
      toast.info(`${newJoin.name || "A user"} joined the lecture.`);
    }
    prevParticipantsRef.current = participants;
  }, [participants]);

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

// Alternative layout structure for LectureStreaming if you want full-width participant list

return (
  <div className="flex min-h-screen pt-24">
    {/* Sidebar - Participants (Fixed to left side) */}
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 left-0 top-24 bottom-0 overflow-y-auto">
      <ParticipantList participants={participants} />
    </div>

    {/* Main Content - Video (with left margin to account for fixed sidebar) */}
    <div className="flex-1 flex flex-col items-center px-4 py-6" style={{ marginRight: '174px' }}>
      <h2 className="text-2xl font-bold mb-4 text-center">Lecture Room</h2>
      <div className="relative w-full max-w-[720px] aspect-video rounded-lg overflow-hidden bg-gray-100 shadow-sm">
        <video
          id="local-video"
          className="w-full h-full bg-black"
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
        <div className="w-full max-w-[720px] mt-6">
          <LectureChat socket={socket} roomId={roomId} isHost={true} />
        </div>
      )}
    </div>

    {/* End Confirmation Dialog */}
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
