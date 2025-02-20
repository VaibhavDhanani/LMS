import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  createDraft,
  getDrafts,
  deleteDraft,
} from '../services/draft.service';
import { getInstructorCourse } from '../services/course.service';
import * as MyCourseComponents from '../components/MyCoursePage/components.jsx';
import { MoreVertical, Calendar, List } from 'lucide-react';
import { scheduleLecture } from '../services/lecture.service.jsx';
const MyCourses = () => {
  const [draftCourses, setDraftCourses] = useState([]);
  const [publishedCourses, setPublishedCourses] = useState([]);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    date: '',
    startTime: '',
    duration: '',
    description: ''
  });
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [formMessage, setFormMessage] = useState(null); // For errors inside the form
  const [formMessageType, setFormMessageType] = useState(null); // 'error' or 'success'
  const [globalMessage, setGlobalMessage] = useState(null); // For success outside
  const [globalMessageType, setGlobalMessageType] = useState(null);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(null); // Reset previous messages

    try {
      if (!selectedCourseId || !user?.id) {
        setFormMessage("Course ID or Teacher ID is missing.");
        setFormMessageType("error");
        return;
      }

      const lectureData = {
        ...scheduleForm,
        courseId: selectedCourseId,
        instructorId: user.id,
      };

      // Call API to schedule lecture
      const response = await scheduleLecture(lectureData, token);

      // if (response.success) {
      // Success message outside modal
      setGlobalMessage("Lecture scheduled successfully!");
      setGlobalMessageType("success");

      // Reset form and close modal
      setScheduleForm({
        title: "",
        date: "",
        startTime: "",
        duration: "",
        description: "",
      });
      setIsScheduleModalOpen(false);
      setSelectedCourseId(null);
      // } else {
      //   // Show error inside form (e.g., time clash)
      //   console.log(response);
      //   setFormMessage(response.message || "Failed to schedule lecture.");
      //   setFormMessageType("error");
      // }
    } catch (error) {
      console.error("Error scheduling lecture:", error);
      setFormMessage(error.response.data.message);
      setFormMessageType("error");
    }
  };

  const handleDropdownClick = (courseId, e) => {
    e.stopPropagation();
    setActiveDropdownId(activeDropdownId === courseId ? null : courseId);
  };

  const handleScheduleClick = (courseId, e) => {
    e.stopPropagation();
    setSelectedCourseId(courseId);
    setIsScheduleModalOpen(true);
    setActiveDropdownId(null);
  };

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
            <MyCourseComponents.Button onClick={() => setIsModalOpen(true)}>
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Create New Course
              </span>
            </MyCourseComponents.Button>
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
        {globalMessage && (
          <div className={`alert ${globalMessageType === "success" ? "alert-success" : "alert-error"}`}>
            {globalMessage}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6">
          {filteredCourses.map((course) => (
            <MyCourseComponents.Card
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
                        {course.isPublished && (
                          <p className="text-gray-600">
                            {course.studentCount || 0} students · {course.lessonCount || 0} lessons
                          </p>
                        )}
                      </div>
                      <MyCourseComponents.Badge variant={course.isPublished ? "default" : "secondary"}>
                        {course.isPublished ? "Active" : "Draft"}
                      </MyCourseComponents.Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">
                    Last updated: {new Date(course.updatedAt).toLocaleDateString()}
                  </p>

                  <div className="flex justify-between items-center mt-auto">
                    <MyCourseComponents.Button variant="outline">
                      {course.isPublished ? "View Course" : "View Draft"}
                    </MyCourseComponents.Button>
                    <div className="flex gap-2">
                      <MyCourseComponents.Button
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
                      </MyCourseComponents.Button>
                      {!course.isPublished && (
                        <MyCourseComponents.Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDeleteDraft(course._id, e)}
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                        </MyCourseComponents.Button>
                      )}
                      <div className="relative">
                        <MyCourseComponents.Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleDropdownClick(course._id, e)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </MyCourseComponents.Button>
                        {activeDropdownId === course._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                onClick={(e) => handleScheduleClick(course._id, e)}
                              >
                                <Calendar className="w-4 h-4" />
                                Schedule Live Lecture
                              </button>
                              <button
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add navigation to manage lectures page
                                  navigate(`/course/${course._id}/lectures`);
                                }}
                              >
                                <List className="w-4 h-4" />
                                Manage Live Lectures
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MyCourseComponents.Card>

          ))}
        </div>
      </div>

      <MyCourseComponents.Modal
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
        <MyCourseComponents.Button
          onClick={handleAddCourse}
          className="w-full"
          disabled={!newCourseTitle.trim()}
        >
          Create Draft
        </MyCourseComponents.Button>
      </MyCourseComponents.Modal>
      <MyCourseComponents.Modal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setSelectedCourseId(null);
        }}
        title="Schedule Live Lecture"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4">
          {formMessage && (
            <div className={`alert ${formMessageType === "error" ? "alert-error" : "alert-success"}`}>
              {formMessage}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lecture Title
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={scheduleForm.title}
              onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={scheduleForm.date}
              onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={scheduleForm.startTime}
              onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={scheduleForm.duration}
              onChange={(e) => setScheduleForm({ ...scheduleForm, duration: e.target.value })}
              required
              min="1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={scheduleForm.description}
              onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
              rows="3"
            />
          </div>
          <MyCourseComponents.Button type="submit" className="w-full">
            Schedule Lecture
          </MyCourseComponents.Button>
        </form>
      </MyCourseComponents.Modal>
    </div>
  );
};

export default MyCourses;