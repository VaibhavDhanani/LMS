import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import * as MyCourseComponents from '../components/MyCoursePage/components.jsx';
import { Calendar, Clock, Users, Video, Edit, Trash2, ExternalLink } from 'lucide-react';
import {
    fetchLectures as fetchLiveLectures,
    updateLecture,
    deleteLecture,
    startLecture,
    joinLecture,
    fetchStudentLectures
} from '../services/lecture.service.jsx';
import { toast } from 'react-toastify';
import { ScheduleLectureModal } from '@/forms/liveLecture.jsx';
const ManageLiveLectures = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const [lectures, setLectures] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedLecture, setSelectedLecture] = useState(null);
    const [editForm, setEditForm] = useState({
        title: '',
        date: '',
        startTime: '',
        duration: '',
        description: ''
    });

    useEffect(() => {
        fetchLectureData();
    }, [courseId, user.isInstructor]);

    const fetchLectureData = async () => {
        try {
            const res = user.isInstructor
                ? await fetchLiveLectures(user.id, token)
                : await fetchStudentLectures(user.id, token);

            if (res.success) {
                setLectures(res.data);
            }
        } catch (error) {
            console.error('Error fetching lectures:', error);
            toast.error("Failed to fetch lectures. Please check your connection and try again.");
        }
    };

    const handleStartLecture = async (lectureId) => {
        try {
            const response = await startLecture(lectureId, user.id, token);
            if (response.success) {
                navigate(`/livelecture/${lectureId}`);
            }
        } catch (error) {
            console.error('Error starting lecture:', error);
            toast.error("Failed to start lecture. Please try again.");
        }
    };

    const handleJoinLecture = async (lectureId) => {
        try {
            const response = await joinLecture(lectureId, user.id, token);
            if (response.success) {
                if (response.data) {
                    navigate(`/livelecture/view/${lectureId}`);
                }else{
                    toast.error("Something went wrong. Please try again");
                }
            } else {
                toast.warning("Lecture not started. Please wait for the instructor to start the lecture.");
            }
        } catch (error) {
            console.error('Error joining lecture:', error);
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
            description: lecture.description
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
            console.error('Error deleting lecture:', error);
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

        if (days > 0) return `${days} day${days > 1 ? "s" : ""} ${hours} hour${hours > 1 ? "s" : ""}`;
        if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ${minutes} minute${minutes > 1 ? "s" : ""}`;
        return `${minutes} minute${minutes !== 1 ? "s" : ""} ${seconds} second${seconds !== 1 ? "s" : ""}`;
    };

    const isLectureStartable = (lecture) => {
        const lectureDateTime = new Date(`${lecture.date}T${lecture.startTime}`);
        const now = new Date();
        const timeDiff = (lectureDateTime - now) / (1000 * 60);
        return timeDiff <= 30;
    };

    const renderLectureActions = (lecture) => {
        if (user.isInstructor) {
            return (
                <div className="flex gap-2">
                    {isLectureStartable(lecture) ? (
                        <MyCourseComponents.Button onClick={() => handleStartLecture(lecture._id)}>
                            <Video className="w-4 h-4 mr-2" />
                            Start Lecture
                        </MyCourseComponents.Button>
                    ) : (
                        <MyCourseComponents.Button disabled>
                            <Clock className="w-4 h-4 mr-2" />
                            Starts in {calculateTimeRemaining(lecture)}
                        </MyCourseComponents.Button>
                    )}
                    <MyCourseComponents.Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditLecture(lecture)}
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                    </MyCourseComponents.Button>
                    <MyCourseComponents.Button
                        variant="destructive"
                        size="sm"
                        onClick={() => confirmDeleteLecture(lecture)}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                    </MyCourseComponents.Button>
                </div>
            );
        }

        return (
            <MyCourseComponents.Button
                onClick={() => handleJoinLecture(lecture._id)}
                disabled={!isLectureStartable(lecture)}
            >
                <Video className="w-4 h-4 mr-2" />
                {isLectureStartable(lecture) ? 'Join Lecture' : `Starts in ${calculateTimeRemaining(lecture)}`}
            </MyCourseComponents.Button>
        );
    };

    return (
        <div className="w-full py-8 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold mb-2">Live Lectures</h1>
                    <p className="text-gray-600">
                        {user.isInstructor ? 'Manage your upcoming live lectures' : 'Your upcoming lectures'}
                    </p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {lectures.map((lecture) => (
                        <MyCourseComponents.Card key={lecture._id} className="w-full">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">{lecture.title}</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-center text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                <span>{new Date(lecture.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center text-gray-600">
                                                <Clock className="w-4 h-4 mr-2" />
                                                <span>{lecture.startTime} ({lecture.duration} minutes)</span>
                                            </div>
                                        </div>
                                    </div>
                                    {renderLectureActions(lecture)}
                                </div>
                                <p className="text-gray-600 mb-4">{lecture.description}</p>
                            </div>
                        </MyCourseComponents.Card>
                    ))}
                </div>

                {lectures.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No upcoming lectures scheduled</p>
                    </div>
                )}

                {user.isInstructor && (
                    <>
                        <ScheduleLectureModal
                            isOpen={isEditModalOpen}
                            onClose={() => setIsEditModalOpen(false)}
                            courseId={selectedLecture?.courseId}
                            instructorId={user.id}
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
                                    Are you sure you want to delete the lecture "{selectedLecture?.title}"?
                                    This action cannot be undone.
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