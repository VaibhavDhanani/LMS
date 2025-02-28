import React, { useEffect, useState } from "react";
import CourseCard from "../General/CourseCard";
import { getAllCourse } from "@/services/course.service";
import { useAuth } from "@/context/AuthContext";

const CourseSection = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const { user, token } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true before API call
      try {
        const response = await getAllCourse();
        
        if (response.success) {
          setCourses(response.data);
        } else {
          setErrorMessage(response.message || "Failed to fetch courses.");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setErrorMessage("An error occurred while fetching courses.");
      } finally {
        setLoading(false); // Set loading to false after API call
      }
    };

    fetchData();
  }, [token]); // Re-run when the token changes

  return (
    <>
      {user && (
        <h1 className="font-semibold text-2xl m-5 p-5">
          Welcome Back! {user.username}
        </h1>
      )}
      <div className="p-4 space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Available Courses</h2>
          
          {loading ? (
            <p>Loading courses...</p>
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : courses.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {courses.map((course, idx) => (
                <CourseCard key={idx} course={course} />
              ))}
            </div>
          ) : (
            <p>No courses available at the moment.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default CourseSection;
