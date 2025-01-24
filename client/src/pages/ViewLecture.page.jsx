import React, {useEffect, useState} from 'react';
import { FileText, MessageCircle, BookOpen } from 'lucide-react';
import {getCourseById} from "@/services/course.service.jsx";

const VideoPlayer = ({ videoUrl }) => (
    <div className="w-full aspect-video bg-black">
        <video
            controls
            className="w-full h-full"
            src={videoUrl}
        >
            Your browser does not support the video tag.
        </video>
    </div>
);

const LectureList = ({ lectures, onSelectLecture, currentLecture }) => (
    <div className="space-y-2">
        {lectures.map((lecture, index) => (
            <div
                key={index}
                onClick={() => onSelectLecture(lecture)}
                className={`p-2 cursor-pointer hover:bg-base-100 ${currentLecture === lecture ? 'bg-primary text-primary-content' : ''}`}
            >
                <div className="flex items-center justify-between">
                    <span>{lecture.title || 'Untitled Lecture'}</span>
                </div>
            </div>
        ))}
    </div>
);

const NotesSection = () => {
    const [notes, setNotes] = useState('');

    return (
        <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
                <FileText className="text-primary" />
                <h3 className="font-semibold">Lecture Notes</h3>
            </div>
            <textarea
                className="textarea textarea-bordered w-full h-32"
                placeholder="Take your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            ></textarea>
        </div>
    );
};

const ViewLecturePage = () => {
    const id = "67667ad87223de9a00655e24";
    const [course, setCourse] = useState(null);
    const [currentLecture, setCurrentLecture] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const authToken = localStorage.getItem("authToken");
                const fetchedCourse = await getCourseById(id, authToken);
                if (fetchedCourse) {
                    setCourse(fetchedCourse);
                    // Set first lecture only after course is fetched
                    if (fetchedCourse.lectures && fetchedCourse.lectures.length > 0) {
                        setCurrentLecture(fetchedCourse.lectures[0]);
                    }
                } else {
                    console.error('Course not found!');
                }
            } catch (error) {
                console.error('Error fetching course:', error);
            }
        };
        fetchCourse();
    }, [id]);

    // Add conditional rendering to prevent errors
    if (!course) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex min-h-screen">
            <div className="w-8/12 p-4 bg-base-100">
                <div className="sticky top-0">
                    <VideoPlayer
                        videoUrl={course.promotionalVideo}
                    />
                    <div className="mt-4">
                        <h2 className="text-2xl font-bold">{course.title}</h2>
                        <p className="text-sm text-base-content/70">
                            {course.subtitle}
                        </p>
                    </div>
                    <NotesSection />
                </div>
            </div>
            <div className="w-4/12 p-4 bg-base-200">
                <div className="sticky top-0">
                    <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="text-primary" />
                        <h3 className="text-xl font-semibold">Course Lectures</h3>
                    </div>
                    <LectureList
                        lectures={course.lectures}
                        onSelectLecture={setCurrentLecture}
                        currentLecture={currentLecture}
                    />
                </div>
            </div>
        </div>
    );
};
export default ViewLecturePage;