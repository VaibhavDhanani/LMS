import React from 'react';
import { BookOpen } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Learning</h1>
          <p className="mt-2 text-gray-600">Your Enrolled Courses</p>
          <div className="mt-4 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Total Enrolled Courses: {enrolledCourses.length}
            </h3>
          </div>
        </div>

        {enrolledCourses.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <CourseCard key={course._id} course={course} variant="enrolled" />
            ))}
          </div>
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