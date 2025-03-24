import React from 'react';
import { BookOpen, Clock, BarChart2, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, variant = 'default' }) => {
  const progress = course.progress || 0;

  const getTotalDuration = () => {
    if (course.curriculum && course.curriculum.length > 0) {
      const totalMinutes = course.curriculum.reduce((total, section) => {
        return total + section.lectures.reduce((sectionTotal, lecture) => {
          return sectionTotal + (lecture.duration || 0);
        }, 0);
      }, 0);

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours > 0) {
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
      }
      return `${minutes} min`;
    }
    return "Self-paced";
  };

 const navigate = useNavigate();
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow ">
      <div className="flex h-full">
        {/* Thumbnail */}
        <div className="w-1/3 relative">
          <img
            src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070"}
            alt={course.title}
            className="h-full w-full object-cover"
          />
          {variant === 'enrolled' && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200"
            >
              <div 
                className="h-full bg-green-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="w-2/3 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 text-xs rounded-full ${
                progress === 100 
                  ? 'bg-green-100 text-green-700'
                  : progress > 0 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'
              }`}>
                {progress === 100 
                  ? 'Completed' 
                  : progress > 0 
                    ? 'In Progress' 
                    : 'Not Started'}
              </span>
              <span className="text-xs text-gray-500">{course.category}</span>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
              {course.title}
            </h3>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
            <span>{getTotalDuration()}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{course.lessons || 0} lessons</span>
              </div>
            </div>
          </div>

          {variant === 'enrolled' && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {progress}% Complete
                </span>
                <span className="text-xs text-gray-500">
                  {course.completedLessons || 0}/{course.totalLessons || 0} Lessons
                </span>
              </div>
              <button 
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                onClick={()=>{
                    navigate(`${course._id}`);
                }}
              >
                {progress === 0 ? (
                  <>
                    <BookOpen className="w-4 h-4" />
                    Start Learning
                  </>
                ) : progress === 100 ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Review Course
                  </>
                ) : (
                  <>
                    <BarChart2 className="w-4 h-4" />
                    Continue Learning
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;