import React, {useEffect, useState} from 'react';
import { FileText, MessageCircle, BookOpen } from 'lucide-react';
import {fetchCourseById} from "@/services/courseService.jsx";

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

const SectionList = ({ curriculum, onSelectLecture, currentLecture }) => (
    <div className="space-y-2">
        {curriculum.map((section, sectionIndex) => (
            <div key={sectionIndex} className="collapse collapse-arrow border border-base-300">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title font-medium bg-base-200">
                    {section.section}
                </div>
                <div className="collapse-content">
                    {section.lectures.map((lecture, lectureIndex) => (
                        <div
                            key={lectureIndex}
                            onClick={() => onSelectLecture(lecture)}
                            className={`p-2 cursor-pointer hover:bg-base-100 ${currentLecture.title === lecture.title ? 'bg-primary text-primary-content' : ''}`}
                        >
                            <div className="flex items-center justify-between">
                                <span>{lecture.title}</span>
                                <span className="text-sm">{lecture.duration}</span>
                            </div>
                            {lecture.preview && <span className="badge badge-xs badge-accent">Preview</span>}
                        </div>
                    ))}
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

const DiscussionSection = () => {
    const [comment, setComment] = useState('');

    return (
        <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="text-primary" />
                <h3 className="font-semibold">Discussion</h3>
            </div>
            <div className="space-y-2">
        <textarea
            className="textarea textarea-bordered w-full h-24"
            placeholder="Add a comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
        ></textarea>
                <button className="btn btn-primary btn-sm">Post Comment</button>
            </div>
        </div>
    );
};

const ViewLecturePage = () => {
    // const course = {
    //     id: "6750a031da931860f44b6530",
    //     title: "Introduction to Web Development",
    //     subtitle: "Master the fundamentals of modern web development from scratch",
    //     description: "Learn the basics of web development with HTML, CSS, and JavaScript. This comprehensive course takes you from beginner to creating your first interactive websites.",
    //     instructor: {
    //         name: "John Doe",
    //         title: "Senior Web Developer",
    //         rating: 4.7,
    //         totalStudents: 50000,
    //         bio: "With over 10 years of industry experience, John has worked with top tech companies and trained thousands of developers worldwide."
    //     },
    //     videos: [
    //         "https://example.com/videos/html-basics.mp4",
    //         "https://example.com/videos/css-styling.mp4"
    //     ],
    //     materials: [
    //         "https://example.com/materials/web-dev-guide.pdf"
    //     ],
    //     price: {
    //         original: 99.99,
    //         discounted: 49.99
    //     },
    //     details: {
    //         totalHours: 22.5,
    //         lectures: 150,
    //         level: "Beginner",
    //         lastUpdated: new Date(2024, 5, 15)
    //     },
    //     whatYouWillLearn: [
    //         "Understand HTML5 semantic structure",
    //         "Create responsive designs with CSS",
    //         "Build interactive web pages with JavaScript",
    //         "Understand basic web development principles",
    //         "Create your first portfolio website"
    //     ],
    //     whichTechStackYouwillLearn:["html","css","javascript","python","react","node"],
    //     prerequisites: [
    //         "No prior coding experience required",
    //         "Basic computer skills",
    //         "Enthusiasm to learn"
    //     ],
    //     curriculum: [
    //         {
    //             section: "Getting Started",
    //             lectures: [
    //                 { title: "Course Introduction", duration: "00:15:00", preview: true },
    //                 { title: "Setting Up Development Environment", duration: "00:45:00" }
    //             ]
    //         },
    //         {
    //             section: "HTML Fundamentals",
    //             lectures: [
    //                 { title: "HTML Basic Structure", duration: "01:00:00" },
    //                 { title: "HTML Elements and Tags", duration: "01:30:00" }
    //             ]
    //         }
    //     ],
    //     requirements: [
    //         "Computer with internet connection",
    //         "Text editor (VS Code recommended)",
    //         "Modern web browser"
    //     ],
    //     targetStudents: [
    //         "Beginners wanting to start web development",
    //         "Students looking to change career",
    //         "Hobbyists interested in coding"
    //     ],
    //     rating: 4.3,
    //     reviews: [
    //         {
    //             id: "6750a1ee84ae8f51e7659c60",
    //             userName: "Sarah M.",
    //             rating: 5,
    //             comment: "Excellent course for beginners! Explained concepts clearly."
    //         },
    //         {
    //             id: "6750a31e185128ce3213ba55",
    //             userName: "Mike P.",
    //             rating: 4,
    //             comment: "Great introduction to web development. Recommended for newcomers."
    //         }
    //     ],
    //     isActive: true,
    //     createdAt: new Date(1688812200000)
    // };
    const id = "67667ad87223de9a00655e24";
    const [course,setCourse] = useState(null);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const fetchedCourse = await fetchCourseById(id);
                if (fetchedCourse) {
                    console.log(fetchedCourse);
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
    console.log(course);


    // const [currentLecture, setCurrentLecture] = useState(
    //     course.curriculum[0].lectures[0]
    // );

    return (
        <div className="flex min-h-screen">
            {/*<div className="w-8/12 p-4 bg-base-100">*/}
            {/*    <div className="sticky top-0">*/}
            {/*        <VideoPlayer*/}
            {/*            videoUrl={course.videos[0]}*/}
            {/*        />*/}
            {/*        <div className="mt-4">*/}
            {/*            <h2 className="text-2xl font-bold">{currentLecture.title}</h2>*/}
            {/*            <p className="text-sm text-base-content/70">*/}
            {/*                Lecture Duration: {currentLecture.duration}*/}
            {/*            </p>*/}
            {/*        </div>*/}
            {/*        <NotesSection />*/}
            {/*        <DiscussionSection />*/}
            {/*    </div>*/}
            {/*</div>*/}
            {/*<div className="w-4/12 p-4 bg-base-200">*/}
            {/*    <div className="sticky top-0">*/}
            {/*        <div className="flex items-center gap-2 mb-4">*/}
            {/*            <BookOpen className="text-primary" />*/}
            {/*            <h3 className="text-xl font-semibold">Course Curriculum</h3>*/}
            {/*        </div>*/}
            {/*        <SectionList*/}
            {/*            curriculum={course.curriculum}*/}
            {/*            onSelectLecture={setCurrentLecture}*/}
            {/*            currentLecture={currentLecture}*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*</div>*/}
            <div>Vaibhav</div>
        </div>
    );
};

export default ViewLecturePage;