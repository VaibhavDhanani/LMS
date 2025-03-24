import React from 'react';
import { BookOpen, Trophy, Clock, Target } from 'lucide-react';
import CourseCard from '@/components/General/LearningPage.card';
import { useAuth } from '@/context/AuthContext';

const MyLearningPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Please Log In</h2>
          <p className="text-gray-600">Sign in to access your learning dashboard</p>
        </div>
      </div>
    );
  }

  const enrolledCourses = user.enrolledCourses || [];
  const completedCourses = enrolledCourses.filter(course => course.progress === 100);
  const inProgressCourses = enrolledCourses.filter(course => course.progress > 0 && course.progress < 100);
  const notStartedCourses = enrolledCourses.filter(course => !course.progress);

  const stats = [
    {
      icon: BookOpen,
      label: 'Total Courses',
      value: enrolledCourses.length,
      color: 'bg-blue-500',
    },
    {
      icon: Trophy,
      label: 'Completed',
      value: completedCourses.length,
      color: 'bg-green-500',
    },
    {
      icon: Clock,
      label: 'In Progress',
      value: inProgressCourses.length,
      color: 'bg-yellow-500',
    },
    {
      icon: Target,
      label: 'Not Started',
      value: notStartedCourses.length,
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
          <p className="mt-2 text-gray-600">Track your progress and continue learning</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className={`w-12 h-12 rounded-full ${stat.color} bg-opacity-10 flex items-center justify-center mb-4`}>
                <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {enrolledCourses.length > 0 ? (
          <>
            {/* In Progress Section */}
            {inProgressCourses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Continue Learning</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {inProgressCourses.map((course) => (
                    <CourseCard key={course._id} course={course} variant="enrolled" />
                  ))}
                </div>
              </div>
            )}

            {/* Not Started Section */}
            {notStartedCourses.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Start Learning</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {notStartedCourses.map((course) => (
                    <CourseCard key={course._id} course={course} variant="enrolled" />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Section */}
            {completedCourses.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Courses</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {completedCourses.map((course) => (
                    <CourseCard key={course._id} course={course} variant="enrolled" />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Courses Yet</h2>
            <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course</p>
            <button 
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              onClick={() => {/* Navigate to course catalog */}}
            >
              Explore Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyLearningPage;