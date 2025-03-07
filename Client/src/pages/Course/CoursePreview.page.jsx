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
    <div className="container mx-auto px-4 py-8">
      <CourseHeader course={course} />
      
      <CourseTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewTab course={course} />}
      {activeTab === 'curriculum' && <CurriculumTab course={course} />}
      {activeTab === 'instructor' && <InstructorTab course={course} />}
      {activeTab === 'reviews' && <ReviewsTab course={course} />}

      <PrerequisitesSection course={course} />
    </div>
  );
};

export default CoursePreviewPage;