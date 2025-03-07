import React, { useState } from 'react';
import VideoPlay from './VideoPlay';

export const CurriculumTab = ({ course }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };
  const formatDuration = (decimalMinutes) => {
    if (!decimalMinutes) return "0:00"; // Handle empty values
  
    const totalSeconds = Math.round(decimalMinutes * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
  
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  };
  
  
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
      {course.curriculum.map((section, index) => (
        <div 
        key={index} 
        className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4"
        >
          <input 
            type="checkbox" 
            checked={!!expandedSections[index]} 
            onChange={() => toggleSection(index)} 
          />
          <div className="collapse-title text-xl font-medium">
            {section.section}
          </div>
          {expandedSections[index] && (
            <div className="collapse-content">
              <ul className="space-y-4">
                {section.lectures.map((lecture, lectureIndex) => (
                  <li 
                  key={lectureIndex} 
                  className="flex flex-col justify-between p-2 bg-base-200 rounded"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <span>{lecture.title} </span>
                        {lecture.preview && (
                          <span className="badge badge-primary ml-2">Preview</span>
                        )}
                      </div>
                    <span className="text-sm text-gray-600">{formatDuration(lecture.duration)}</span>
                    </div>

                    {lecture.preview && lecture.video && (
                      <div className="w-full mt-4">
                          <VideoPlay 
                            src={lecture.video} 
                            className="w-full aspect-video" 
                          />
                        </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};