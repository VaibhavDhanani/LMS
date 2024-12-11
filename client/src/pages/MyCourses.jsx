import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const MyCourses = () => {
  const [draftCourses, setDraftCourses] = useState([]);
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddCourse = () => {
    if (newCourseTitle.trim()) {
      const newCourse = {
        id: Date.now(),
        title: newCourseTitle,
        createdAt: new Date().toISOString(),
      };
      setDraftCourses([...draftCourses, newCourse]);
      setNewCourseTitle('');
      setIsModalOpen(false);
    }
  };

  const CourseCard = ({ course, isDraft }) => (
    <div
      onClick={() => window.location.href = `/course-form/${course.id}`}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow duration-200"
    >
      <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
      <p className="text-sm text-gray-500">
        Created: {new Date(course.createdAt).toLocaleDateString()}
      </p>
      {isDraft && (
        <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
          Draft
        </span>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
            </DialogHeader>
            <div className="p-4">
              <Input
                type="text"
                placeholder="Enter course title"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                className="mb-4"
              />
              <Button
                onClick={handleAddCourse}
                className="w-full"
                disabled={!newCourseTitle.trim()}
              >
                Create Draft
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-8">
        {/* Draft Courses Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Draft Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {draftCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                isDraft={true}
              />
            ))}
          </div>
        </div>

        {/* Published Courses Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Published Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {publishedCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                isDraft={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
