import React from "react";

const VideoPlay = ({src}) => {
  return (
    <div className="video-container mb-6">
      <video
        className="w-full h-auto rounded-md shadow-lg"
        autoPlay
        controls
      >
        <source
          src={src}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlay;
