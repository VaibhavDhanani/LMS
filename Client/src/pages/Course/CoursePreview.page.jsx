import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCourseById } from '../../services/course.service';
import { CourseHeader } from '../../components/General/CourseHeader';
import { CourseTabs } from '../../components/General/CourseTabs';
import { OverviewTab } from '../../components/General/OverviewTab';
import { CurriculumTab } from '../../components/General/CurriculumTab';
import { InstructorTab } from '../../components/General/InstructorTab';
import { ReviewsTab } from '../../components/General/ReviewsTab';
import { PrerequisitesSection } from '../../components/General/PrerequisitesSection';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

const CoursePreviewPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const fetchedCourse = await getCourseById(id, token);
        
        if (fetchedCourse.success) {
          setCourse(fetchedCourse.data);
        } else {
          console.error(fetchedCourse.message);
          toast.error('Failed to load course details');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Error loading course details');
      } finally {
        setLoading(false);
      }
    };
  
    fetchCourse();
  }, [id, token]);

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading course...</div>;
  }

  if (!course) {
    return <div className="container mx-auto px-4 py-8">Course not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-16">
      <CourseHeader course={course} />
{/* New Section for Course Details */}
<div className="bg-gray-100 p-6 rounded-lg shadow-md my-6">
  {/* Topics as Badges */}
  <div className="flex flex-wrap gap-2 mb-4">
    {course.topics?.map((topic, index) => (
      <span key={index} className="bg-gray-400 text-white text-sm font-semibold px-3 py-1 rounded-full">
        {topic}
      </span>
    ))}
  </div>

  {/* Course Title & Description */}
  <h2 className="text-xl font-semibold text-gray-800">{course.title}</h2>
  <p className="text-gray-700 mt-2">{course.description}</p>

  {/* Course Details */}
  <div className="mt-4">
    <h3 className="text-lg font-semibold text-gray-800">Course Details:</h3>
    <p className="text-gray-700"><strong>Level:</strong> {course.details.level}</p>
    <p className="text-gray-700"><strong>Language:</strong> {course.details.language}</p>
  </div>
</div>

  
      <CourseTabs activeTab={activeTab} setActiveTab={setActiveTab} />
  
      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab course={course} />}
      {activeTab === 'curriculum' && <CurriculumTab course={course} />}
      {activeTab === 'instructor' && <InstructorTab course={course} />}
      {activeTab === 'reviews' && <ReviewsTab course={course} />}
  
      <PrerequisitesSection course={course} />
    </div>
  );
}  
export default CoursePreviewPage;