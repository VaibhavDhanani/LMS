import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchCourseById } from '@/services/courseService.jsx';

import { CourseHeader } from '../components/General/CourseHeader';
import { CourseTabs } from '../components/General/CourseTabs';
import { OverviewTab } from '../components/General/OverviewTab';
import { CurriculumTab } from '../components/General/CurriculumTab';
import { InstructorTab } from '../components/General/InstructorTab';
import { ReviewsTab } from '../components/General/ReviewsTab';
import { PrerequisitesSection } from '../components/General/PrerequisitesSection';


// Expanded Course Object with More Details
const coursed = {
  id: "6750a031da931860f44b6530",
  title: "Introduction to Web Development",
  subtitle: "Master the fundamentals of modern web development from scratch",
  description: "Learn the basics of web development with HTML, CSS, and JavaScript. This comprehensive course takes you from beginner to creating your first interactive websites.",
  instructor: {
    name: "John Doe",
    title: "Senior Web Developer",
    rating: 4.7,
    totalStudents: 50000,
    bio: "With over 10 years of industry experience, John has worked with top tech companies and trained thousands of developers worldwide."
  },
  videos: [
    "https://example.com/videos/html-basics.mp4",
    "https://example.com/videos/css-styling.mp4"
  ],
  materials: [
    "https://example.com/materials/web-dev-guide.pdf"
  ],
  price: {
    original: 99.99,
    discounted: 49.99
  },
  details: {
    totalHours: 22.5,
    lectures: 150,
    level: "Beginner",
    lastUpdated: new Date(2024, 5, 15)
  },
  whatYouWillLearn: [
    "Understand HTML5 semantic structure",
    "Create responsive designs with CSS",
    "Build interactive web pages with JavaScript",
    "Understand basic web development principles",
    "Create your first portfolio website"
  ],
  whichTechStackYouwillLearn:["html","css","javascript","python","react","node"],
  prerequisites: [
    "No prior coding experience required",
    "Basic computer skills",
    "Enthusiasm to learn"
  ],
  curriculum: [
    {
      section: "Getting Started",
      lectures: [
        { title: "Course Introduction", duration: "00:15:00", preview: true },
        { title: "Setting Up Development Environment", duration: "00:45:00" }
      ]
    },
    {
      section: "HTML Fundamentals",
      lectures: [
        { title: "HTML Basic Structure", duration: "01:00:00" },
        { title: "HTML Elements and Tags", duration: "01:30:00" }
      ]
    }
  ],
  requirements: [
    "Computer with internet connection",
    "Text editor (VS Code recommended)",
    "Modern web browser"
  ],
  targetStudents: [
    "Beginners wanting to start web development",
    "Students looking to change career",
    "Hobbyists interested in coding"
  ],
  rating: 4.3,
  reviews: [
    {
      id: "6750a1ee84ae8f51e7659c60",
      userName: "Sarah M.",
      rating: 5,
      comment: "Excellent course for beginners! Explained concepts clearly."
    },
    {
      id: "6750a31e185128ce3213ba55",
      userName: "Mike P.",
      rating: 4,
      comment: "Great introduction to web development. Recommended for newcomers."
    }
  ],
  isActive: true,
  createdAt: new Date(1688812200000)
};

const CoursePreviewPage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const fetchedCourse = await fetchCourseById(id);
        if (fetchedCourse) {
          setCourse(fetchedCourse);
        } else {
          console.error('Course not found!');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      }
    };
    fetchCourse();
  }, [id]);

  if (!course) {
    return <div className="container mx-auto px-4 py-8">Loading course...</div>;
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <CourseHeader course={course} />
        <CourseTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab course={course} />}
        {activeTab === 'curriculum' && <CurriculumTab course={coursed} />}
        {activeTab === 'instructor' && <InstructorTab course={coursed} />}
        {activeTab === 'reviews' && <ReviewsTab course={coursed} />}

        <PrerequisitesSection course={coursed} />
      </div>
  );
};

export default CoursePreviewPage;
