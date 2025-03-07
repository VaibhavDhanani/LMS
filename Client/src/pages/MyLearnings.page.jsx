import React from "react";
import CourseCard from "../components/General/CourseCard";
import { useAuth } from "@/context/AuthContext";

const MyLearningPage = () => {
  const { user } = useAuth();

  if (!user) {
    return <div className="text-center mt-10">Please log in to view your courses.</div>;
  }

  const enrolledCourses = user.enrolledCourses || [];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Learning</h1>

      {enrolledCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <CourseCard key={course._id} course={course} variant="enrolled" />
          ))}
        </div>
      ) : (
        <div className="text-center mt-10">
          <p className="text-xl text-gray-600">You haven't enrolled in any courses yet.</p>
          <button 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => {/* Navigate to course catalog */}}
          >
            Explore Courses
          </button>
        </div>
      )}

      {/* Progress Summary Section */}
      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4">Learning Progress</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-medium">Total Courses</h3>
            <p className="text-3xl font-bold">{enrolledCourses.length}</p>
          </div>
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-medium">Completed Courses</h3>
            <p className="text-3xl font-bold">
              {enrolledCourses.filter(course => course.completed).length}
            </p>
          </div>
          <div className="bg-white shadow rounded p-4">
            <h3 className="text-lg font-medium">In Progress</h3>
            <p className="text-3xl font-bold">
              {enrolledCourses.filter(course => !course.completed).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLearningPage;
