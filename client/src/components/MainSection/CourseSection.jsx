import React, { useEffect, useState } from "react";
import CourseCard from "../General/CourseCard";
import { getAllCourse } from "@/services/course.service";
import { useAuth } from "@/context/AuthContext";

const CourseSection = () => {
  const [courses, SetCourse] = useState([]); // Initialize with an empty array
  const { user, token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAllCourse(token);
        SetCourse(data);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };

    fetchData(); // Call the async function
  }, [token]); // Add `token` to the dependency array in case it changes

  return (
    <>
      {user && (
        <h1 className="font-semibold text-2xl m-5 p-5">
          Welcome Back! {user.username}
        </h1>
      )}
      <div className="p-4 space-y-8">

        {/* Render the dynamically fetched courses */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Courses</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {courses && courses.length > 0 ? (
              courses.map((course, idx) => (
                <CourseCard key={idx} course={course} />
              ))
            ) : (
              <p>No courses available at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseSection;
