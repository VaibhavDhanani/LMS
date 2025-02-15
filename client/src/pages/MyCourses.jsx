import React, { useState, useEffect } from 'react';
import { Plus, Trash } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  createDraft,
  getDrafts,
  deleteDraft,
} from '../services/draft.service.jsx';
import { getInstructorCourse } from '../services/course.service.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const MyCourses = () => {
  const [draftCourses, setDraftCourses] = useState([]);
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, token } = useAuth();
  const navigate = useNavigate(); // Initialize navigate

  // Fetch Draft Courses and Published Courses
  const fetchCourses = async () => {
    try {
      const drafts = await getDrafts(user.id, token);
      const published = await getInstructorCourse(user.id, token);
      setDraftCourses(drafts);
      setPublishedCourses(published);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  useEffect(() => {
    if (user?.id && token) {
      fetchCourses();
    }
  }, [user, token]);

  const handleAddCourse = async () => {
    if (newCourseTitle.trim()) {
      const newCourse = { title: newCourseTitle, instructor: user.id };
      try {
        await createDraft(newCourse, token);
        setNewCourseTitle('');
        setIsModalOpen(false);
        fetchCourses();
      } catch (error) {
        console.error('Error creating draft course:', error);
      }
    }
  };

  const handleDeleteDraft = async (courseId) => {
    try {
      await deleteDraft(courseId, token);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting draft course:', error);
    }
  };

  const CourseCard = ({ course, isDraft }) => (
    <div
      className="relative bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
      onClick={() =>
        navigate(isDraft ? `/draft/${course._id}` : `/courseform/${course._id}`)
      } // Navigate to different routes
    >
      <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
      <p className="text-sm text-gray-500">
        Created: {new Date(course.createdAt).toLocaleDateString()}
      </p>
      {isDraft && (
        <>
          <span className="inline-block mt-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
            Draft
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering the navigation
              handleDeleteDraft(course._id);
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
            title="Delete Draft"
          >
            <Trash className="w-5 h-5" />
          </button>
        </>
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
          {draftCourses.length === 0 ? (
            <p>No draft courses available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {draftCourses.map((course) => (
                <CourseCard key={course._id} course={course} isDraft={true} />
              ))}
            </div>
          )}
        </div>

        {/* Published Courses Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Published Courses</h2>
          {publishedCourses.length === 0 ? (
            <p>No published courses available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {publishedCourses.map((course) => (
                <CourseCard key={course._id} course={course} isDraft={false} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
