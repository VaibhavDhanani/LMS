import { X, Play } from "lucide-react";
import { useRef, useState } from "react";
import ReactPlayer from "react-player";

const VideoPlay = ({ thumbnail, src }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [progressTime, setProgressTime] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playerRef = useRef(null);
  const quizTimestamp = 5; // Time in seconds for quiz display

  // Handles video progress and shows quiz at the specified timestamp
  const handleProgress = ({ playedSeconds }) => {
    setProgressTime(playedSeconds);
    if (Math.floor(playedSeconds) === quizTimestamp && !quizAnswered) {
      setShowQuiz(true);
      playerRef.current?.getInternalPlayer()?.pause();
    }
  };

  // Handles quiz submission and resumes video playback
  const handleQuizSubmit = (e) => {
    e.preventDefault();
    setShowQuiz(false);
    setQuizAnswered(true);
    playerRef.current?.getInternalPlayer()?.play();
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Video Player */}
      <div
        onContextMenu={(e) => e.preventDefault()} // Disable right-click menu
        className="relative"
      >
        {thumbnail && !isPlaying && (
          <div className="relative cursor-pointer" onClick={handlePlay}>
            <img
              src={thumbnail}
              alt="Video thumbnail"
              className="w-full rounded-lg"
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg hover:bg-opacity-20 transition-opacity">
              <div className="bg-white bg-opacity-75 rounded-full p-4 shadow-lg transform transition-transform hover:scale-110">
                <Play className="w-12 h-12 text-indigo-600" />
              </div>
              <span className="absolute bottom-4 text-white font-medium bg-black bg-opacity-50 px-3 py-1 rounded-full">
                Click to play video
              </span>
            </div>
          </div>
        )}
        <ReactPlayer
          ref={playerRef}
          url={src}
          controls
          playing={isPlaying}
          onPlay={handlePlay}
          onProgress={handleProgress}
          width="100%"
          config={{
            file: {
              attributes: {
                controlsList: "nodownload", // Disable download button
                disablePictureInPicture: true, // Prevent PiP mode
              },
            },
          }}
          style={!thumbnail || isPlaying ? {} : { display: "none" }} // Show only when playing or if no thumbnail
        />
      </div>

      {/* Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 relative">
            {/* Close Button */}
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={() => {
                setShowQuiz(false);
                playerRef.current?.getInternalPlayer()?.play();
              }}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Quiz Form */}
            <form onSubmit={handleQuizSubmit} className="space-y-4">
              <h3 className="text-xl font-bold text-center mb-4">Quiz Time!</h3>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    What key concept did you just learn?
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24"
                  placeholder="Enter your answer here"
                  required
                />
              </div>
              <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary btn-block">
                  Submit Answer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlay;