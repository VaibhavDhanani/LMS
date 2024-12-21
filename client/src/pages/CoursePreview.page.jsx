import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";  // Import useParams to get the courseId from URL
import { CourseHeader } from "../components/General/CourseHeader";
import { CourseTabs } from "../components/General/CourseTabs";
import { OverviewTab } from "../components/General/OverviewTab";
import { CurriculumTab } from "../components/General/CurriculumTab";
import { InstructorTab } from "../components/General/InstructorTab";
import { ReviewsTab } from "../components/General/ReviewsTab";
import { PrerequisitesSection } from "../components/General/PrerequisitesSection";
import { getCourse } from "@/services/course.service";  // Import the service to fetch the course
import { useAuth } from "@/context/AuthContext";
const CoursePreviewPage = () => {
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const { id: courseId } = useParams();  // Get courseId from URL params
  const {user ,token} = useAuth();
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseData = await getCourse(courseId,token);  // Fetch course using getCourse method
        setCourse(courseData);
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  if (!course) {
    return <div className="container mx-auto px-4 py-8">Loading course details...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <CourseHeader course={course} />

      <CourseTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab course={course} />}
      {activeTab === "curriculum" && <CurriculumTab course={course} />}
      {activeTab === "instructor" && <InstructorTab course={course} />}
      {activeTab === "reviews" && <ReviewsTab course={course} />}

      <PrerequisitesSection course={course} />
    </div>
  );
};

export default CoursePreviewPage;
