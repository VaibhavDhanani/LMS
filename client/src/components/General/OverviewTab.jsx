import React from 'react';
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
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* What You'll Learn Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">What You'll Learn</h2>
        <ul className="space-y-2">
          {course.whatYouWillLearn.map((item, index) => (
            <li key={index} className="flex items-start">
              <CheckIcon className="mr-2 text-primary" />
              <span className='prose'>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tech Stack Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Tech Stack You'll Learn</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {course.whichTechStackYouwillLearn.map((tech, index) => {
            const TechIcon = techIcons[tech.toLowerCase()];
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
            <span>{course.details.totalHours} total hours</span>
          </div>
          <div className="flex items-center">
            <BarChart className="mr-2 text-primary" />
            <span>Skill Level: {course.details.level}</span>
          </div>
          <div className="flex items-center">
            <FileText className="mr-2 text-primary" />
            <span>{course.details.lectures} lectures</span>
          </div>
          <div className="flex items-center">
            <Users className="mr-2 text-primary" />
            <span>Last Updated: {course.details.lastUpdated.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      
    </div>
  );
};
