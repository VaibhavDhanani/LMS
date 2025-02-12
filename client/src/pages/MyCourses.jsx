import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  createDraft,
  getDrafts,
  deleteDraft,
} from '../services/draft.service';
import { getInstructorCourse } from '../services/course.service';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Card = ({ children, onClick, className }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow ${className}`}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'default', disabled, className = '', size = 'default' }) => {
  const baseStyles = 'rounded-md font-medium transition-colors focus:outline-none';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 hover:bg-gray-50',
    ghost: 'hover:bg-gray-100',
  };
  const sizes = {
    default: 'px-4 py-2',
    icon: 'p-2',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

const MyCourses = () => {
  const [draftCourses, setDraftCourses] = useState([]);
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const drafts = (await getDrafts(user.id, token)).map(course => ({
        ...course,
        isPublished: false, // Ensure drafts are marked
      }));
      const published = (await getInstructorCourse(user.id, token)).map(course => ({
        ...course,
        isPublished: true, // Ensure published courses are marked
      }));
  
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
      try {
        await createDraft({ title: newCourseTitle, instructor: user.id }, token);
        setNewCourseTitle('');
        setIsModalOpen(false);
        fetchCourses();
      } catch (error) {
        console.error('Error creating draft course:', error);
      }
    }
  };

  const handleDeleteDraft = async (courseId, e) => {
    e.stopPropagation();
    try {
      await deleteDraft(courseId, token);
      fetchCourses();
    } catch (error) {
      console.error('Error deleting draft course:', error);
    }
  };

  const filteredCourses = [...draftCourses, ...publishedCourses].filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'draft' && !course.isPublished) ||
      (statusFilter === 'active' && course.isPublished);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">            
          <h1 className="text-3xl font-bold mb-2">My Courses</h1>
          <div className="flex justify-between items-center">
            <p className="text-gray-600">Manage and organize your courses</p>
            <Button onClick={() => setIsModalOpen(true)}>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create New Course
              </span>
            </Button>
          </div>
        </header>

        <div className="flex gap-4 mb-6">
          <input
            type="text"
            className="flex-1 max-w-sm px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="w-[180px] px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredCourses.map((course) => (
            <Card
              key={course._id}
              onClick={() => navigate(course.isPublished ? `/courseform/${course._id}` : `/draft/${course._id}`)}
              className="w-full"
            >
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-48 h-48">
                  <img
                    src={course.thumbnail || "/api/placeholder/400/320"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{course.title}</h3>
                        <p className="text-gray-600">
                          {course.studentCount || 0} students · {course.lessonCount || 0} lessons
                        </p>
                      </div>
                      <Badge variant={course.isPublished ? "default" : "secondary"}>
                        {course.isPublished ? "Active" : "Draft"}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Last updated: {new Date(course.updatedAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center mt-auto">
                    <Button variant="outline">View Course</Button>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(course.isPublished ? `/courseform/${course._id}/edit` : `/draft/${course._id}/edit`);
                        }}
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </Button>
                      {!course.isPublished && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteDraft(course._id, e)}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </Button>
                      )}
                      <Button variant="ghost" size="icon">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Course"
      >
        <input
          type="text"
          className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter course title"
          value={newCourseTitle}
          onChange={(e) => setNewCourseTitle(e.target.value)}
        />
        <Button
          onClick={handleAddCourse}
          className="w-full"
          disabled={!newCourseTitle.trim()}
        >
          Create Draft
        </Button>
      </Modal>
    </div>
  );
};

export default MyCourses;