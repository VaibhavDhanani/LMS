import React from 'react';
import { 
  Clock, 
  BookOpen, 
  PlayCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  // Calculate total course duration
  const getTotalCourseDuration = () => {
    if (!course.curriculum) return "0 min";

    const totalMinutes = course.curriculum.reduce((total, section) => {
      return total + section.lectures.reduce((sectionTotal, lecture) => {
        return sectionTotal + (lecture.duration || 0);
      }, 0);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours > 0) {
      return `${hours} hr ${minutes > 0 ? `${minutes} min` : ''}`;
    }
    return `${minutes} min`;
  };

  
  const getTotalLectures = () => {
    if (!course.curriculum) return 0;
    return course.curriculum.reduce((total, section) => {
      return total + section.lectures.length;
    }, 0);
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070"}
          alt={course.title}
          className="w-full h-48 object-cover"
        />
      </div>

      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h2>
        <p className="text-gray-600 mb-4 line-clamp-3">{course.subtitle }</p>
        <p className="text-gray-600 mb-4 line-clamp-3">Created By: {course.instructor?.name}</p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-sm">Duration: {getTotalCourseDuration()}</span>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-500" />
            <span className="text-sm">Lectures: {getTotalLectures()}</span>
          </div>

          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-purple-500" />
            <span className="text-sm">Course Level: {course.details?.level || 'Not Specified'}</span>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-md font-semibold mb-2">Course Sections:</h3>
          <ul className="list-disc list-inside text-sm text-gray-600">
            {course.curriculum?.map((section, index) => (
              <li key={index}>{section.section} - {section.lectures.length} lectures</li>
            ))}
          </ul>
        </div>

        <button 
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          onClick={() => navigate(`/courses/${course._id}`)}
        >
          Continue Learning
        </button>
      </div>
    </div>
  );
};

export default CourseCard;