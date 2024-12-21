import { useState, useRef } from "react";
import {
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "../../apis/firebase.config.js";
import { Loader2, Plus, X, ChevronDown, ChevronRight, Trash2 } from "lucide-react";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const VideoContainer = ({ videoUrl, onRemove, className = "", onLoadedMetadata }) => {
  const videoRef = useRef(null);

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="bg-gray-100 rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="relative aspect-video w-full max-w-lg">
          <video 
            ref={videoRef}
            controls 
            className="w-full h-full rounded-md"
            onLoadedMetadata={onLoadedMetadata}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <button
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"
            onClick={onRemove}
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ThumbnailContainer = ({ thumbnailUrl, onRemove, className = "" }) => (
  <div className={`relative inline-block ${className}`}>
    <div className="bg-gray-100 rounded-lg p-2 shadow-sm border border-gray-200">
      <img src={thumbnailUrl} alt="Thumbnail" className="w-32 h-32 object-cover rounded-md" />
      <button
        className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-colors"
        onClick={onRemove}
      >
        <X size={16} />
      </button>
    </div>
  </div>
);

const formatDuration = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const CurriculumStep = ({ formData, updateFormData }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});
  const [errors, setErrors] = useState({});

  // Handle file upload
  const handleFileUpload = async (file, type, lectureIndex) => {
    if (!file) return;

    const uploadKey = `${type}-${lectureIndex ?? "main"}`;
    setUploadStatus({ ...uploadStatus, [uploadKey]: true });
    setErrors({ ...errors, [uploadKey]: null });

    try {
      const uniqueName = `${type}-${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `${type}s/${uniqueName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      if (lectureIndex !== undefined) {
        const updatedLectures = [...formData.lectures];
        if (type === "video") {
          updatedLectures[lectureIndex].videoUrl = url;
        } else if (type === "lectureThumbnail") {
          updatedLectures[lectureIndex].thumbnailUrl = url;
        }
        updateFormData("lectures", updatedLectures);
      } else {
        updateFormData(type, url);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setErrors({ ...errors, [uploadKey]: "Error uploading file" });
    } finally {
      setUploadStatus({ ...uploadStatus, [uploadKey]: false });
    }
  };

  // Remove file
  const handleRemoveFile = async (url, type, lectureIndex) => {
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);

      if (lectureIndex !== undefined) {
        const updatedLectures = [...formData.lectures];
        if (type === "video") {
          updatedLectures[lectureIndex].videoUrl = "";
          updatedLectures[lectureIndex].duration = 0;
        } else if (type === "lectureThumbnail") {
          updatedLectures[lectureIndex].thumbnailUrl = "";
        }
        updateFormData("lectures", updatedLectures);
      } else {
        updateFormData(type, "");
      }
    } catch (error) {
      console.error("Error removing file:", error);
    }
  };

  // Handle video duration
  const handleVideoDuration = (index, event) => {
    const durationInSeconds = Math.floor(event.target.duration);
    
    const updatedLectures = [...formData.lectures];
    updatedLectures[index].duration = durationInSeconds;
    updateFormData("lectures", updatedLectures);
  };

  // Add new lecture at a specific index
  const addLectureAtIndex = (index) => {
    const newLecture = {
      title: "",
      description: "",
      videoUrl: "",
      thumbnailUrl: "",
      duration: 0,
      preview: false,
    };

    const updatedLectures = [...formData.lectures];
    updatedLectures.splice(index + 1, 0, newLecture);
    updateFormData("lectures", updatedLectures);
  };

  // Remove lecture
  const removeLecture = (index) => {
    const updatedLectures = [...formData.lectures];
    updatedLectures.splice(index, 1);
    updateFormData("lectures", updatedLectures);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  // Update lecture details
  const updateLecture = (index, field, value) => {
    const updatedLectures = [...formData.lectures];
    updatedLectures[index][field] = value;
    updateFormData("lectures", updatedLectures);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Course Curriculum</h2>

      {/* Course Media Section */}
      <div className="space-y-6 p-6 border rounded-lg bg-gray-50">
        <h3 className="text-xl font-semibold">Course Media</h3>

        {/* Course Thumbnail */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Course Thumbnail</label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="file-input file-input-bordered w-full"
              onChange={(e) => handleFileUpload(e.target.files[0], "thumbnail")}
            />
            {uploadStatus["thumbnail-main"] && <Loader2 className="animate-spin" size={24} />}
          </div>
          {errors["thumbnail-main"] && <p className="text-red-500 text-sm">{errors["thumbnail-main"]}</p>}
          {formData.thumbnail && (
            <ThumbnailContainer 
              thumbnailUrl={formData.thumbnail}
              onRemove={() => handleRemoveFile(formData.thumbnail, "thumbnail")}
              className="mt-4"
            />
          )}
        </div>

        {/* Promotional Video */}
        <div className="space-y-2">
          <label className="text-sm font-semibold">Promotional Video</label>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".mp4,.webm,.mov,.m4v"
              className="file-input file-input-bordered w-full"
              onChange={(e) => handleFileUpload(e.target.files[0], "promotionalVideo")}
            />
            {uploadStatus["promotionalVideo-main"] && <Loader2 className="animate-spin" size={24} />}
          </div>
          {errors["promotionalVideo-main"] && <p className="text-red-500 text-sm">{errors["promotionalVideo-main"]}</p>}
          {formData.promotionalVideo && (
            <VideoContainer 
              videoUrl={formData.promotionalVideo} 
              onRemove={() => handleRemoveFile(formData.promotionalVideo, "promotionalVideo")}
              className="mt-4"
            />
          )}
        </div>
      </div>

      {/* Lectures Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">Lectures ({formData.lectures.length})</h3>

        {formData.lectures.map((lecture, index) => (
          <div key={index} className="border rounded-lg p-4 relative group">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              {expandedIndex === index ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              <span className="font-semibold">
                {lecture.title ? lecture.title : `Lecture ${index + 1}`}
              </span>
              {lecture.duration > 0 && (
                <span className="text-sm text-gray-500">({formatDuration(lecture.duration)})</span>
              )}
            </div>

            {/* Expanded Content */}
            {expandedIndex === index && (
              <div className="mt-4 space-y-4 pl-6">
                {/* Title Field */}
                <div>
                  <label className="text-sm font-semibold">Title</label>
                  <input
                    type="text"
                    className="input input-bordered w-full mt-2"
                    value={lecture.title}
                    onChange={(e) => updateLecture(index, "title", e.target.value)}
                    placeholder="Enter lecture title"
                  />
                </div>

                {/* Description Field */}
                <div>
                  <label className="text-sm font-semibold">Description</label>
                  <textarea
                    className="textarea textarea-bordered w-full mt-2"
                    value={lecture.description}
                    onChange={(e) => updateLecture(index, "description", e.target.value)}
                    placeholder="Enter lecture description"
                    rows={3}
                  />
                </div>

                {/* Lecture Thumbnail */}
                <div>
                  <label className="text-sm font-semibold">Lecture Thumbnail</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    className="file-input file-input-bordered w-full mt-2"
                    onChange={(e) => handleFileUpload(e.target.files[0], "lectureThumbnail", index)}
                  />
                  {uploadStatus[`lectureThumbnail-${index}`] && <Loader2 className="animate-spin" size={24} />}
                  {errors[`lectureThumbnail-${index}`] && (
                    <p className="text-red-500 text-sm">{errors[`lectureThumbnail-${index}`]}</p>
                  )}

                  {lecture.thumbnailUrl && (
                    <ThumbnailContainer 
                      thumbnailUrl={lecture.thumbnailUrl}
                      onRemove={() => handleRemoveFile(lecture.thumbnailUrl, "lectureThumbnail", index)}
                      className="mt-4"
                    />
                  )}
                </div>

                {/* Video */}
                <div>
                  <label className="text-sm font-semibold">Video</label>
                  <input
                    type="file"
                    accept=".mp4,.webm,.mov,.m4v"
                    className="file-input file-input-bordered w-full mt-2"
                    onChange={(e) => handleFileUpload(e.target.files[0], "video", index)}
                  />
                  {uploadStatus[`video-${index}`] && <Loader2 className="animate-spin" size={24} />}
                  {errors[`video-${index}`] && <p className="text-red-500 text-sm">{errors[`video-${index}`]}</p>}

                  {lecture.videoUrl && (
                    <VideoContainer 
                      videoUrl={lecture.videoUrl} 
                      onRemove={() => handleRemoveFile(lecture.videoUrl, "video", index)}
                      onLoadedMetadata={(e) => handleVideoDuration(index, e)}
                      className="mt-4"
                    />
                  )}
                </div>

                {/* Preview Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={lecture.preview}
                    onChange={(e) => updateLecture(index, "preview", e.target.checked)}
                  />
                  <label className="text-sm font-semibold">Mark as Preview</label>
                </div>
              </div>
            )}

            {/* Delete Lecture */}
            <div className="absolute top-2 right-2">
              <button
                onClick={() => removeLecture(index)}
                className="btn btn-ghost text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => addLectureAtIndex(formData.lectures.length - 1)}
          className="btn btn-outline w-full"
        >
          <Plus size={16} className="mr-2" />
          Add New Lecture
        </button>
      </div>
    </div>
  );
};

export default CurriculumStep;