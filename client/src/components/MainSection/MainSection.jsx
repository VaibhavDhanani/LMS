import { fetchAllCourses } from '@/services/courseService';
import { useEffect, useState } from 'react';
import CourseCard from '../General/CourseCard';

const MainSection = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchAllCourses();
        console.log(response.data);
        setCourses(() => response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };

    fetchData();
  }, []);


  const data = [
    {
      title: 'Your Learning',
      content: courses,
    },
    {
      title: 'Your Learning',
      content: courses,
    },
  ];

  return (
    <div className="p-4 space-y-8">
      {data.map((section, index) => (
        <div key={index} className="space-y-4">
          <h2 className="text-2xl font-bold">{section.title}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {section.content.map((course, idx) => (
              <CourseCard key={idx} course={course} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MainSection;
