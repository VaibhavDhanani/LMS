import { useState } from "react";
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

const CurriculumStep = ({ formData, updateFormData }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({});
  const [errors, setErrors] = useState({});

  // Validate file
  const validateFile = (file, type) => {
    const allowedTypes = type === "video" ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
    const maxSize = type === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (!allowedTypes.includes(file.type)) {
      return `Only ${type === "video" ? "MP4, WebM, MOV, M4V" : "JPEG, PNG, WebP"} files are allowed`;
    }
    if (file.size > maxSize) {
      return `File size should be less than ${maxSize / (1024 * 1024)}MB`;
    }
    return null;
  };

  // Handle file upload
  const handleFileUpload = async (file, type, lectureIndex) => {
    if (!file) return;

    const uploadKey = `${type}-${lectureIndex ?? 'main'}`;
    setUploadStatus({ ...uploadStatus, [uploadKey]: true });
    setErrors({ ...errors, [uploadKey]: null });

    try {
      const uniqueName = `${type}-${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `${type}s/${uniqueName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      if (lectureIndex !== undefined) {
        // Update lecture video
        const updatedLectures = [...formData.lectures];
        updatedLectures[lectureIndex].video = url;
        updateFormData("lectures", updatedLectures);
      } else {
        // Update thumbnail or promotional video
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
        // Remove lecture video
        const updatedLectures = [...formData.lectures];
        updatedLectures[lectureIndex].video = "";
        updateFormData("lectures", updatedLectures);
      } else {
        // Remove thumbnail or promotional video
        updateFormData(type, "");
      }
    } catch (error) {
      console.error("Error removing file:", error);
    }
  };

  // Add new lecture at a specific index
  const addLectureAtIndex = (index) => {
    const newLecture = {
      title: "",
      description: "",
      video: "",
      duration: "",
      preview: false,
    };

    const updatedLectures = [...formData.lectures];
    updatedLectures.splice(index + 1, 0, newLecture); // Add lecture after the current one
    updateFormData("lectures", updatedLectures);
  };

  // Remove lecture
  const removeLecture = (index) => {
    const updatedLectures = [...formData.lectures];
    updatedLectures.splice(index, 1);
    
    updateFormData("lectures", updatedLectures);

    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  // Update lecture details
  const updateLecture = (index, field, value) => {
    const updatedLectures = [...formData.lectures];
    updatedLectures[index][field] = value;
    
    updateFormData("lectures", updatedLectures);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Create Course</h2>

      {/* Thumbnail Upload */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">Course Thumbnail</label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="file-input file-input-bordered w-full"
            onChange={(e) => handleFileUpload(e.target.files[0], 'thumbnail')}
          />
          {uploadStatus['thumbnail-main'] && (
            <Loader2 className="animate-spin" size={24} />
          )}
        </div>
        {errors['thumbnail-main'] && (
          <p className="text-red-500 text-sm">{errors['thumbnail-main']}</p>
        )}
        {formData.thumbnail && (
          <div className="relative inline-block">
            <img
              src={formData.thumbnail}
              alt="Thumbnail"
              className="w-32 h-32 object-cover rounded"
            />
            <button
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              onClick={() => handleRemoveFile(formData.thumbnail, 'thumbnail')}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Promotional Video Upload */}
      <div className="space-y-2">
        <label className="text-sm font-semibold">Promotional Video</label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept=".mp4,.webm,.mov,.m4v"
            className="file-input file-input-bordered w-full"
            onChange={(e) => handleFileUpload(e.target.files[0], 'promotionalVideo')}
          />
          {uploadStatus['promotionalVideo-main'] && (
            <Loader2 className="animate-spin" size={24} />
          )}
        </div>
        {errors['promotionalVideo-main'] && (
          <p className="text-red-500 text-sm">{errors['promotionalVideo-main']}</p>
        )}
        {formData.promotionalVideo && (
          <div className="relative inline-block">
            <video width="320" height="240" controls className="rounded">
              <source src={formData.promotionalVideo} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <button
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
              onClick={() => handleRemoveFile(formData.promotionalVideo, 'promotionalVideo')}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Lectures Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">
          Lectures ({formData.lectures.length})
        </h3>
        
        {formData.lectures.map((lecture, index) => (
          <div key={index} className="border rounded-lg p-4 relative group">
            {/* Lecture Header */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            >
              {expandedIndex === index ? (
                <ChevronDown size={20} />
              ) : (
                <ChevronRight size={20} />
              )}
              <span className="font-semibold">Lecture {index + 1}</span>
            </div>

            {/* Expanded Content */}
            {expandedIndex === index && (
              <div className="mt-4 space-y-4 pl-6">
                {/* Title */}
                <div>
                  <label className="text-sm font-semibold">Title</label>
                  <input
                    type="text"
                    className="input input-bordered w-full mt-1"
                    value={lecture.title}
                    onChange={(e) => updateLecture(index, 'title', e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-semibold">Description</label>
                  <textarea
                    className="textarea textarea-bordered w-full mt-1"
                    value={lecture.description}
                    onChange={(e) => updateLecture(index, 'description', e.target.value)}
                  />
                </div>

                {/* Video */}
                <div>
                  <label className="text-sm font-semibold">Video</label>
                  <input
                    type="file"
                    accept=".mp4,.webm,.mov,.m4v"
                    className="file-input file-input-bordered w-full mt-1"
                    onChange={(e) => handleFileUpload(e.target.files[0], 'video', index)}
                  />
                  {uploadStatus[`video-${index}`] && <Loader2 className="animate-spin" size={24} />}
                </div>

                {/* Remove Video Button */}
                {lecture.video && (
                  <div className="relative inline-block">
                    <video width="320" height="240" controls className="rounded">
                      <source src={lecture.video} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                    <button
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      onClick={() => handleRemoveFile(lecture.video, 'video', index)}
                    >
                      <X size={16} />
                    </button>
                </div>
                )}
              </div>
            )}

            {/* Hover Remove Button */}
            <button
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeLecture(index)}
            >
              <Trash2 size={20} />
            </button>
          </div>
        ))}
      </div>

      {/* Add Lecture Button */}
      <button
        className="btn btn-primary mt-4"
        onClick={() => addLectureAtIndex(formData.lectures.length - 1)}
      >
        Add Lecture
      </button>
    </div>
  );
};

export default CurriculumStep;
