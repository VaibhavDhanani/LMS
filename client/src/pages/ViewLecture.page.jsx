import {BookOpen, ChevronDown, ChevronUp, FileText, X} from "lucide-react";
import {useState, useEffect } from "react";
import {useParams} from "react-router-dom";
import {useAuth} from "@/context/AuthContext.jsx";
import {getCourseById} from "@/services/course.service.jsx";

const VideoPlayer = ({ videoUrl, key }) => {
	return (
		<div className="w-full aspect-video bg-black">
			<video
				key={key}
				controls
				className="w-full h-full"
				src={videoUrl}
			>
				Your browser does not support the video tag.
			</video>
		</div>
	);
};

const LectureList = ({ curriculum, onSelectLecture, currentLecture }) => {
	const [expandedSections, setExpandedSections] = useState({});
	
	const toggleSection = (sectionIndex) => {
		setExpandedSections((prev) => ({
			...prev,
			[sectionIndex]: !prev[sectionIndex],
		}));
	};
	
	return (
		<div className="space-y-4">
			{curriculum.map((section, sectionIndex) => (
				<div key={sectionIndex} className="border border-base-300 rounded-lg overflow-hidden">
					<div
						className="bg-base-200 p-3 cursor-pointer flex justify-between items-center"
						onClick={() => toggleSection(sectionIndex)}
					>
						<h4 className="font-semibold">{section.section}</h4>
						{expandedSections[sectionIndex] ? <ChevronUp /> : <ChevronDown />}
					</div>
					{expandedSections[sectionIndex] && (
						<div className="p-2 space-y-2">
							{section.lectures.map((lecture, lectureIndex) => (
								<div
									key={lectureIndex}
									onClick={() => {
										onSelectLecture(lecture)
										console.log("lectureIndex", lecture,lectureIndex);
									}} // Update current lecture
									className={`p-2 cursor-pointer hover:bg-base-100 rounded ${currentLecture === lecture ? "bg-primary text-primary-content" : ""
									}`}
								>
									<div className="flex items-center justify-between">
										<span>{lecture.title}</span>
										<div className="flex items-center space-x-2">
											{lecture.preview && (
												<span className="text-white bg-blue-500 px-2 py-1 rounded-full">
                          Preview
                        </span>
											)}
											<span className="text-sm opacity-70">{lecture.duration}</span>
										</div>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			))}
		</div>
	);
};

const NotesSection = ({ lectureName }) => {
	const [notes, setNotes] = useState("");
	
	const handleDownload = () => {
		const blob = new Blob([notes], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${lectureName || "lecture_notes"}.txt`; // Default to "lecture_notes.txt" if no lectureName is provided
		a.click();
		URL.revokeObjectURL(url);
	};
	
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
			<button
				onClick={handleDownload}
				className="btn btn-primary mt-2"
				disabled={!notes.trim()} // Disable the button if notes are empty
			>
				Download Notes
			</button>
		</div>
	);
};


const ViewLecturePage = () => {
	const { id } = useParams();
	const [course, setCourse] = useState(null);
	const [currentLecture, setCurrentLecture] = useState(null);
	const { token } = useAuth();
	const [videoKey, setVideoKey] = useState(0);
	
	useEffect(() => {
		const fetchCourse = async () => {
			try {
				const res = await getCourseById(id, token);
				if (res.success) {
					setCourse(res.data);
					if (
						course.curriculum &&
						course.curriculum.length > 0 &&
						course.curriculum[0].lectures.length > 0
					) {
						setCurrentLecture(course.curriculum[0].lectures[0]);
					}
				} else {
					console.error("Course not found!");
				}
			} catch (error) {
				console.error("Error fetching course:", error);
			}
		};
		fetchCourse();
	}, [id, token]);
	
	const handleSelectLecture = (lecture) => {
		setCurrentLecture(lecture);
		setVideoKey(prevKey => prevKey + 1); // Force video to reset
	};
	
	if (!course) {
		return <div>Loading...</div>;
	}
	
	return (
		<div className="flex min-h-screen">
			<div className="w-8/12 p-4 bg-base-100">
				<div className="sticky top-0">
					<VideoPlayer
						key={videoKey}
						videoUrl={currentLecture?.video || course.promotionalVideo}
					/>
					<div className="mt-4">
						<h2 className="text-2xl font-bold">{currentLecture?.title || course.title}</h2>
						<p className="text-sm text-base-content/70">{currentLecture?.description || course.subtitle}</p>
					</div>
					<NotesSection lectureName={currentLecture?.title || course.title} />
				</div>
			</div>
			<div className="w-4/12 p-4 bg-base-200">
				<div className="sticky top-0">
					<div className="flex items-center gap-2 mb-4">
						<BookOpen className="text-primary" />
						<h3 className="text-xl font-semibold">Course Curriculum</h3>
					</div>
					<LectureList
						curriculum={course.curriculum}
						onSelectLecture={handleSelectLecture}
						currentLecture={currentLecture}
					/>
				</div>
			</div>
		</div>
	);
};

export default ViewLecturePage;