import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import * as MyCourseComponents from "../../components/MyCoursePage/components.jsx";
import {
  Calendar,
  Clock,
  Users,
  Video,
  Edit,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  fetchLectures as fetchLiveLectures,
  deleteLecture,
  startLecture,
  joinLecture,
  fetchStudentLectures,
} from "../../services/lecture.service.jsx";

import { toast } from "react-toastify";
import { ScheduleLectureModal } from "@/forms/liveLecture.jsx";

const ManageLiveLectures = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [lectures, setLectures] = useState([]);
  const [filteredLectures, setFilteredLectures] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    startTime: "",
    duration: "",
    description: "",
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [lecturesPerPage] = useState(5);

  useEffect(() => {
    fetchLectureData();
  }, [courseId, user.isInstructor]);

  // Apply filters and search whenever lectures change or filters change
  useEffect(() => {
    applyFiltersAndSearch();
  }, [lectures, searchTerm, statusFilter]);

  const fetchLectureData = async () => {
    try {
      const res = user.isInstructor
        ? await fetchLiveLectures(token)
        : await fetchStudentLectures(token);

      if (res.success) {
        // Add status to each lecture
        const lecturesWithStatus = res.data.map((lecture) => {
          const status = getLectureStatus(lecture);
          return { ...lecture, status };
        });
        setLectures(lecturesWithStatus);
      }
    } catch (error) {
      console.error("Error fetching lectures:", error);
      toast.error(
        "Failed to fetch lectures. Please check your connection and try again."
      );
    }
  };

  const getLectureStatus = (lecture) => {
    return lecture.status;
  };

  const applyFiltersAndSearch = () => {
    let result = [...lectures];

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((lecture) => lecture.status === statusFilter);
    }

    // Apply search
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      result = result.filter(
        (lecture) =>
          lecture.title.toLowerCase().includes(search) ||
          lecture.course.title.toLowerCase().includes(search) ||
          lecture.date.includes(search)
      );
    }

    setFilteredLectures(result);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleStartLecture = async (lectureId) => {
    try {
      const response = await startLecture(lectureId, token);
      if (response.success) {
        navigate(`/livelecture/${lectureId}`);
      } else {
        toast.error(response.message || "Lecture not started.");
      }
    } catch (error) {
      console.error("Error starting lecture:", error);
      toast.error("Failed to start lecture. Please try again.");
    }
  };

  const handleJoinLecture = async (lectureId) => {
    try {
      const response = await joinLecture(lectureId, token);
      if (response.success) {
        if (response.data) {
          navigate(`/livelecture/view/${lectureId}`);
        } else {
          toast.error("Something went wrong. Please try again");
        }
      } else {
        toast.warning(
          "Lecture not started. Please wait for the instructor to start the lecture."
        );
      }
    } catch (error) {
      console.error("Error joining lecture:", error);
      toast.error("Failed to join lecture. Please try again.");
    }
  };

  const handleEditLecture = (lecture) => {
    setSelectedLecture(lecture);
    setEditForm({
      title: lecture.title,
      date: lecture.date,
      startTime: lecture.startTime,
      duration: lecture.duration,
      description: lecture.description,
    });
    setIsEditModalOpen(true);
  };

  const confirmDeleteLecture = (lecture) => {
    setSelectedLecture(lecture);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteLecture = async () => {
    try {
      await deleteLecture(selectedLecture._id, token);
      fetchLectureData();
      setIsDeleteModalOpen(false);
      toast.success("Lecture deleted successfully!");
    } catch (error) {
      console.error("Error deleting lecture:", error);
      toast.error("Failed to delete the lecture. Please try again.");
    }
  };

  const calculateTimeRemaining = (lecture) => {
    const lectureDateTime = new Date(`${lecture.date}T${lecture.startTime}`);
    const now = new Date();
    const timeDiff = (lectureDateTime - now) / 1000;

    if (timeDiff <= 0) return "Starting now";

    const days = Math.floor(timeDiff / (24 * 3600));
    const hours = Math.floor((timeDiff % (24 * 3600)) / 3600);
    const minutes = Math.floor((timeDiff % 3600) / 60);
    const seconds = Math.floor(timeDiff % 60);

    if (days > 0)
      return `${days} day${days > 1 ? "s" : ""} ${hours} hour${
        hours > 1 ? "s" : ""
      }`;
    if (hours > 0)
      return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${
        minutes > 1 ? "s" : ""
      }`;
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ${seconds} second${
      seconds !== 1 ? "s" : ""
    }`;
  };

  const renderLectureActions = (lecture) => {
    const { status } = lecture;

    if (user.isInstructor) {
      return (
        <div className="flex gap-2">
          {status === "scheduled" && isLectureStartable(lecture) ? (
            <MyCourseComponents.Button
              onClick={() => handleStartLecture(lecture._id)}
            >
              <Video className="w-4 h-4 mr-2" />
              Start Lecture
            </MyCourseComponents.Button>
          ) : status === "ongoing" ? (
            <MyCourseComponents.Button
              onClick={() => handleStartLecture(lecture._id)}
            >
              <Video className="w-4 h-4 mr-2" />
              Continue Lecture
            </MyCourseComponents.Button>
          ) : status === "completed" ? (
            <MyCourseComponents.Button variant="outline" disabled>
              <Clock className="w-4 h-4 mr-2" />
              Completed
            </MyCourseComponents.Button>
          ) : (
            <MyCourseComponents.Button className="flex items-center" disabled>
              <Clock className="w-4 h-4 mr-2 " />
              Starts in {calculateTimeRemaining(lecture)}
            </MyCourseComponents.Button>
          )}

          {status !== "completed" && (
            <>
              <MyCourseComponents.Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
                onClick={() => handleEditLecture(lecture)}
              >
                <Edit className="w-4 h-4 ml-2" />
                <p className="mr-2">Edit</p>
              </MyCourseComponents.Button>

              <MyCourseComponents.Button
                variant="destructive"
                size="sm"
                className="flex items-center gap-2 bg-red-500 text-white hover:bg-red-600 transition-all"
                onClick={() => confirmDeleteLecture(lecture)}
              >
                <Trash2 className="w-4 h-4 ml-2" />
                <p className="mr-2">Delete</p>
              </MyCourseComponents.Button>
            </>
          )}
        </div>
      );
    }

    // Student actions
    return (
      <MyCourseComponents.Button
        onClick={() => handleJoinLecture(lecture._id)}
        disabled={
          status === "completed" ||
          (status === "scheduled" && !isLectureStartable(lecture))
        }
      >
        <Video className="w-4 h-4 mr-2" />
        {status === "ongoing"
          ? "Join Lecture"
          : status === "completed"
          ? "Lecture Ended"
          : `Starts in ${calculateTimeRemaining(lecture)}`}
      </MyCourseComponents.Button>
    );
  };

  const isLectureStartable = (lecture) => {
    const lectureDateTime = new Date(`${lecture.date}T${lecture.startTime}`);
    const now = new Date();
    const timeDiff = (lectureDateTime - now) / (1000 * 60);
    return timeDiff <= 30;
  };

  // Pagination logic
  const indexOfLastLecture = currentPage * lecturesPerPage;
  const indexOfFirstLecture = indexOfLastLecture - lecturesPerPage;
  const currentLectures = filteredLectures.slice(
    indexOfFirstLecture,
    indexOfLastLecture
  );
  const totalPages = Math.ceil(filteredLectures.length / lecturesPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "ongoing":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full py-8 px-4 md:px-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Live Lectures</h1>
          <p className="text-gray-600">
            {user.isInstructor
              ? "Manage your live lectures"
              : "Your Live lectures"}
          </p>
        </header>

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by lecture title, course, or date..."
                className="pl-10 p-2 border border-gray-300 rounded-md w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                className="p-2 border border-gray-300 rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Lectures</option>
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lectures List */}
        <div className="grid grid-cols-1 gap-6">
          {currentLectures.length > 0 ? (
            currentLectures.map((lecture) => (
              <div
                key={lecture._id}
                className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow w-full
                                ${
                                  lecture.status === "ongoing"
                                    ? "border-l-4 border-green-500"
                                    : lecture.status === "completed"
                                    ? "border-l-4 border-gray-400"
                                    : ""
                                }`}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold">
                          Title: {lecture.title}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            lecture.status
                          )}`}
                        >
                          {lecture.status.charAt(0).toUpperCase() +
                            lecture.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-4">
                        Course: {lecture.course.title}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {new Date(lecture.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>
                            {lecture.startTime} ({lecture.duration} minutes)
                          </span>
                        </div>
                      </div>
                    </div>
                    {renderLectureActions(lecture)}
                  </div>
                  <p className="text-gray-600 mb-4">
                    Description: {lecture.description}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "No lectures match your search criteria"
                  : "No upcoming lectures scheduled"}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {filteredLectures.length > lecturesPerPage && (
          <div className="flex justify-center mt-8">
            <nav className="flex items-center gap-1">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === number
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {number}
                  </button>
                )
              )}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </nav>
          </div>
        )}

        {/* Modals */}
        {user.isInstructor && (
          <>
            <ScheduleLectureModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              course={selectedLecture?.course}
              instructorId={user._id}
              token={token}
              existingLecture={selectedLecture}
              onScheduleSuccess={() => {
                fetchLectureData();
              }}
            />

            <MyCourseComponents.Modal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              title="Delete Lecture"
            >
              <div className="py-4">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete the lecture "
                  {selectedLecture?.title}"? This action cannot be undone.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <MyCourseComponents.Button
                    variant="outline"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </MyCourseComponents.Button>
                  <MyCourseComponents.Button
                    variant="destructive"
                    onClick={handleDeleteLecture}
                  >
                    Delete
                  </MyCourseComponents.Button>
                </div>
              </div>
            </MyCourseComponents.Modal>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageLiveLectures;
