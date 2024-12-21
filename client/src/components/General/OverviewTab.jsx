import React, { useMemo } from 'react';
import { Clock, BarChart, FileText, Users } from 'lucide-react';
import { CheckIcon } from './CheckIcon';
import { 
  SiHtml5, 
  SiCss3, 
  SiJavascript, 
  SiPython, 
  SiReact, 
  SiNodedotjs 
} from 'react-icons/si';

// Mapping of tech stack to icons
const techIcons = {
  'html': SiHtml5,
  'css': SiCss3,
  'javascript': SiJavascript,
  'python': SiPython,
  'react': SiReact,
  'node': SiNodedotjs
};

export const OverviewTab = ({ course }) => {
  // Memoizing total seconds calculation
  const totalSeconds = useMemo(() => {
    return course.lectures?.reduce((total, lecture) => total + lecture.duration, 0) || 0;
  }, [course.lectures]);

  // Convert total seconds into hours and minutes
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  const formattedTotalTime = hours > 0 
    ? `${hours} hours ${minutes} minutes` 
    : `${minutes} minutes`;

  // Format last updated date
  const formattedLastUpdated = new Date(course.lastUpdated).toLocaleDateString();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* What You'll Learn Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
        <ul className="space-y-2">
          {course.learnpoints?.map((item, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon className="mr-2 text-primary" />
              <span className="prose">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tech Stack Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Tech Stack You'll Learn</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {course.technologies?.map((tech, index) => {
            const techLower = tech.toLowerCase();
            const TechIcon = techIcons[techLower];
            return (
              <div 
                key={index} 
                className="flex flex-col items-center p-2 bg-base-100 rounded-lg shadow-md w-24"
              >
                {TechIcon ? (
                  <TechIcon className="w-8 h-8 mb-2 text-primary" />
                ) : (
                  <div className="w-10 h-10 mb-2 bg-gray-200 rounded-full flex items-center justify-center">
                    {tech.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm">{tech.toUpperCase()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Course Details Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Course Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center">
            <Clock className="mr-2 text-primary" />
            <span>{formattedTotalTime}</span> {/* Display formatted total time */}
          </div>
          <div className="flex items-center">
            <BarChart className="mr-2 text-primary" />
            <span>Skill Level: {course.details.level}</span>
          </div>
          <div className="flex items-center">
            <FileText className="mr-2 text-primary" />
            <span>{course.lectures.length} lectures</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-2 text-primary" />
            <span>Last Updated: {formattedLastUpdated}</span> {/* Display formatted last updated date */}
          </div>
        </div>
      </div>
    </div>
  );
};
  