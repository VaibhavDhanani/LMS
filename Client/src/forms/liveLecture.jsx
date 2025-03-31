import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { scheduleLecture, updateLecture } from '../services/lecture.service';
import * as MyCourseComponents from '../components/MyCoursePage/components.jsx';

export const ScheduleLectureModal = ({ 
  isOpen, 
  onClose, 
  course, 
  instructorId, 
  token, 
  onScheduleSuccess, 
  existingLecture = null // Optional prop for updating
}) => {
  const [formMessage, setFormMessage] = useState(null);
  const [formMessageType, setFormMessageType] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    date: '',
    startTime: '',
    duration: '',
    description: ''
  });
  // console.log(course);
  useEffect(() => {
    if (existingLecture) {
      setScheduleForm({
        title: existingLecture.title || '',
        date: existingLecture.date ? existingLecture.date.split('T')[0] : '',
        startTime: existingLecture.startTime || '',
        duration: existingLecture.duration || '',
        description: existingLecture.description || ''
      });
    } else {
      resetForm();
    }
  }, [existingLecture]);

  const resetForm = () => {
    setScheduleForm({
      title: '',
      date: '',
      startTime: '',
      duration: '',
      description: ''
    });
    setFormMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormMessage(null);

    try {
      if (!course || !instructorId) {
        setFormMessage("Course ID or Instructor ID is missing.");
        setFormMessageType("error");
        return;
      }

      const lectureData = {
        ...scheduleForm,
        course,
        instructorId
      };

      let response;
      if (existingLecture) {
        // Update Lecture API Call
        response = await updateLecture(existingLecture._id, lectureData, token);
      } else {
        // Schedule New Lecture API Call
        response = await scheduleLecture(lectureData, token);
      }

      if (response.success) {
        toast.success(existingLecture ? "Lecture updated successfully!" : "Lecture scheduled successfully!");
        resetForm();
        onScheduleSuccess?.();
        handleClose();
      } else {
        setFormMessage(response.message || "Failed to process request.");
        setFormMessageType("error");
      }
    } catch (error) {
      console.error("Error handling lecture:", error);
      setFormMessage(error.response?.data?.message || "An error occurred.");
      setFormMessageType("error");
    }
  };

  return (
    <MyCourseComponents.Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={existingLecture ? "Update Lecture" : "Schedule Live Lecture"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {formMessage && (
          <div className={`alert ${formMessageType === "error" ? "alert-error" : "alert-success"}`}>
            {formMessage}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lecture Title</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={scheduleForm.title}
            onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={scheduleForm.date}
            onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
            min={new Date().toISOString().split("T")[0]}
            max={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
          <input
            type="time"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={scheduleForm.startTime}
            onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={scheduleForm.description}
            onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
            rows="3"
          />
        </div>
        <MyCourseComponents.Button type="submit" className="w-full">
          {existingLecture ? "Update Lecture" : "Schedule Lecture"}
        </MyCourseComponents.Button>
      </form>
    </MyCourseComponents.Modal>
  );
};
