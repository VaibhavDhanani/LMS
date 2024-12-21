import React from 'react';

const formatDuration = (seconds) => {
  const hrs = String(Math.floor(seconds / 3600)).padStart(2, '0');
  const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');

  return `${hrs}:${mins}:${secs}`;
};

export const CurriculumTab = ({ course }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
      <div className="space-y-4">
        {course.lectures.map((lecture, index) => (
          <div
            key={index}
            className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box"
          >
            <input type="checkbox" className="peer" />
            <div
              className="collapse-title flex justify-between items-center text-lg font-medium min-h-16"
            >
              <div className="flex items-center gap-2">
                <span>{index + 1}. {lecture.title}</span>
                {lecture.preview && (
                  <span className="px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-600 rounded-full">
                    Preview
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {formatDuration(lecture.duration)}
              </span>
            </div>
            <div className="collapse-content p-4">
              <p className="text-gray-700">{lecture.description || "No description available."}</p>
              {lecture.preview && lecture.videoUrl && (
                <div className="mt-4">
                  <div className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-lg">
                    <div className="pt-[56.25%]">
                      <video
                        className="absolute top-0 left-0 w-full h-full object-contain bg-black"
                        controls
                        poster={lecture.thumbnailUrl}
                      >
                        <source src={lecture.video} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </div>
                </div>
              )}
              {lecture.preview && !lecture.videoUrl && (
                <div className="mt-2 text-sm text-blue-600">
                  This lecture is available for preview.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurriculumTab;
