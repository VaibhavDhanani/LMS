import { X } from 'lucide-react';
import { useRef, useState } from 'react';
import ReactPlayer from 'react-player';

const VideoPlay = ({ src }) => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [progressTime, setProgressTime] = useState(0);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const playerRef = useRef(null);

  const quizTimestamp = 5; // Time in seconds when the quiz appears

  const handleProgress = ({ playedSeconds }) => {
    setProgressTime(playedSeconds);
    if (Math.floor(playedSeconds) === quizTimestamp && !quizAnswered) {
      setShowQuiz(true);
      if (playerRef.current) {
        playerRef.current.getInternalPlayer().pause();
      }
    }
  };

  const handleQuizSubmit = (e) => {
    e.preventDefault();
    // You can add validation logic here
    setShowQuiz(false);
    setQuizAnswered(true);
    if (playerRef.current) {
      playerRef.current.getInternalPlayer().play();
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <ReactPlayer
        ref={playerRef}
        url={src}
        controls
        autoPlay
        onProgress={handleProgress}
        width="100%"
      />

      {showQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-white rounded-lg shadow-xl p-6 w-96 relative">
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
              onClick={() => {
                setShowQuiz(false);
                if (playerRef.current) {
                  playerRef.current.getInternalPlayer().play();
                }
              }}
            >
              <X className="w-6 h-6" />
            </button>

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
