import { useState, useCallback, useEffect } from "react";
import {
  storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "../../apis/firebase.config.js";
import {
  Loader2,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert.jsx";
import ReactPlayer from "react-player";
const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-m4v",
];
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const CurriculumStep = ({ formData, updateFormData }) => {
  const [uploadStatus, setUploadStatus] = useState({});
  const [errors, setErrors] = useState({});
  const [expandedItems, setExpandedItems] = useState({
    sections: new Set(),
    lectures: new Set(),
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "PrintScreen" || (e.ctrlKey && e.key === "u")) {
        e.preventDefault();
        alert("Screenshot is disabled!");
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Toggle expanded state
  const toggleExpanded = useCallback((type, id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [type]: new Set(
        prev[type].has(id)
          ? [...prev[type]].filter((item) => item !== id)
          : [...prev[type], id]
      ),
    }));
  }, []);

  // Validate file
  const validateFile = useCallback((file, type) => {
    // console.log("Detected File Type:", file.type);
    const allowedTypes =
      type === "video" ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
    const maxSize = type === "video" ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;

    if (!allowedTypes.includes(file.type)) {
      return `Only ${
        type === "video" ? "MP4, WebM, MOV, M4V" : "JPEG, PNG, WebP"
      } files are allowed`;
    }
    if (file.size > maxSize) {
      return `File size should be less than ${maxSize / (1024 * 1024)}MB`;
    }
    return null;
  }, []);

  // Handle file upload
  const handleFileUpload = useCallback(
    async (file, type, sectionIndex, lectureIndex) => {
      if (!file) return;

      const getDuration = (file) => {
        return new Promise((resolve) => {
          const videoElement = document.createElement("video");
          videoElement.src = URL.createObjectURL(file);

          videoElement.onloadedmetadata = () => {
            const duration = (videoElement.duration / 60).toFixed(2);
            resolve(duration);
          };
        });
      };

      const uploadKey = `${type}-${sectionIndex ?? "main"}-${
        lectureIndex ?? "main"
      }`;
      const validationError = validateFile(
        file,
        type.includes("video") || type.includes("promotionalVideo")
          ? "video"
          : "image"
      );

      if (validationError) {
        setErrors((prev) => ({ ...prev, [uploadKey]: validationError }));
        return;
      }

      setUploadStatus((prev) => ({ ...prev, [uploadKey]: true }));
      setErrors((prev) => ({ ...prev, [uploadKey]: null }));

      try {
        let duration = null;
        if (type.includes("video") || type.includes("promotionalVideo")) {
          duration = await getDuration(file);
        }

        const uniqueName = `${type}-${Date.now()}-${file.name}`;
        const storageRef = ref(storage, `${type}s/${uniqueName}`);
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);

        if (sectionIndex !== undefined && lectureIndex !== undefined) {
          const updatedCurriculum = [...formData.curriculum];
          updatedCurriculum[sectionIndex].lectures[lectureIndex].video = url;
          if (duration !== null) {
            updatedCurriculum[sectionIndex].lectures[lectureIndex].duration =
              duration;
          }
          updateFormData("curriculum", updatedCurriculum);
        } else {
          updateFormData(type, url);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        setErrors((prev) => ({ ...prev, [uploadKey]: "Error uploading file" }));
      } finally {
        setUploadStatus((prev) => ({ ...prev, [uploadKey]: false }));
      }
    },
    [formData, updateFormData, validateFile]
  );

  // Remove file
  const handleRemoveFile = useCallback(
    async (url, type, sectionIndex, lectureIndex) => {
      try {
        const fileRef = ref(storage, url);
        await deleteObject(fileRef);

        if (sectionIndex !== undefined && lectureIndex !== undefined) {
          const updatedCurriculum = [...formData.curriculum];
          updatedCurriculum[sectionIndex].lectures[lectureIndex].video = "";
          updateFormData("curriculum", updatedCurriculum);
        } else {
          updateFormData(type, "");
        }
      } catch (error) {
        console.error("Error removing file:", error);
        setErrors((prev) => ({
          ...prev,
          [`${type}-${sectionIndex ?? "main"}-${lectureIndex ?? "main"}`]:
            "Error removing file",
        }));
      }
    },
    [formData, updateFormData]
  );

  // Curriculum operations
  const curriculumOperations = {
    addSection: useCallback(() => {
      const newSection = {
        section: "",
        lectures: [],
      };
      updateFormData("curriculum", [...formData.curriculum, newSection]);
    }, [formData, updateFormData]),

    removeSection: useCallback(
      (sectionIndex) => {
        const updatedCurriculum = [...formData.curriculum];
        updatedCurriculum.splice(sectionIndex, 1);
        updateFormData("curriculum", updatedCurriculum);
      },
      [formData, updateFormData]
    ),

    updateSection: useCallback(
      (sectionIndex, field, value) => {
        const updatedCurriculum = [...formData.curriculum];
        updatedCurriculum[sectionIndex][field] = value;
        updateFormData("curriculum", updatedCurriculum);
      },
      [formData, updateFormData]
    ),

    addLecture: useCallback(
      (sectionIndex) => {
        const newLecture = {
          title: "",
          description: "",
          video: "",
          duration: 0,
          preview: false,
        };

        const updatedCurriculum = [...formData.curriculum];
        updatedCurriculum[sectionIndex].lectures.push(newLecture);
        updateFormData("curriculum", updatedCurriculum);
      },
      [formData, updateFormData]
    ),

    removeLecture: useCallback(
      (sectionIndex, lectureIndex) => {
        const updatedCurriculum = [...formData.curriculum];
        updatedCurriculum[sectionIndex].lectures.splice(lectureIndex, 1);
        updateFormData("curriculum", updatedCurriculum);
      },
      [formData, updateFormData]
    ),

    updateLecture: useCallback(
      (sectionIndex, lectureIndex, field, value) => {
        const updatedCurriculum = [...formData.curriculum];
        updatedCurriculum[sectionIndex].lectures[lectureIndex][field] = value;
        updateFormData("curriculum", updatedCurriculum);
      },
      [formData, updateFormData]
    ),
  };

  // Render file upload section
  const renderFileUpload = (type, accept, sectionIndex, lectureIndex) => {
    const key = `${type}-${sectionIndex ?? "main"}-${lectureIndex ?? "main"}`;
    const currentValue =
      sectionIndex !== undefined && lectureIndex !== undefined
        ? formData.curriculum[sectionIndex].lectures[lectureIndex].video
        : formData[type];

    return (
      <div className="space-y-2">
        <label className="text-sm font-semibold">
          {type === "thumbnail" ? "Course Thumbnail" : "Video"}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept={accept}
            className="file-input file-input-bordered w-full"
            onChange={(e) =>
              handleFileUpload(
                e.target.files[0],
                type,
                sectionIndex,
                lectureIndex
              )
            }
          />
          {uploadStatus[key] && <Loader2 className="animate-spin" size={24} />}
        </div>
        {errors[key] && (
          <Alert variant="destructive">
            <AlertDescription>{errors[key]}</AlertDescription>
          </Alert>
        )}
        {currentValue && (
          <div className="relative inline-block">
            {type === "thumbnail" ? (
              <div>
                <div onContextMenu={(e) => e.preventDefault()}>
                  <img
                    src={currentValue}
                    alt="Thumbnail"
                    className="w-56 h-full object-cover rounded"
                    onContextMenu={(e) => e.preventDefault()} // Disable right-click
                    onDragStart={(e) => e.preventDefault()} // Disable dragging
                  />
                </div>
                <button
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  onClick={() =>
                    handleRemoveFile(
                      currentValue,
                      type,
                      sectionIndex,
                      lectureIndex
                    )
                  }
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div>
                <div
                  onContextMenu={(e) => e.preventDefault()}
                  className="rounded w-56 h-full"
                >
                  <ReactPlayer
                    url={currentValue}
                    controls
                    className="rounded w-full h-full"
                  />
                </div>
                <button
                  className="absolute -top-2 -right-[27rem] bg-red-500 text-white rounded-full p-1"
                  onClick={() =>
                    handleRemoveFile(
                      currentValue,
                      type,
                      sectionIndex,
                      lectureIndex
                    )
                  }
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Create Course</h2>

      {/* File Uploads */}
      {renderFileUpload("thumbnail", ".jpg,.jpeg,.png,.webp")}
      {renderFileUpload("promotionalVideo", ".mp4,.webm,.mov,.m4v")}

      {/* Curriculum Sections */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold">
          Curriculum ({formData.curriculum.length} sections)
        </h3>

        {formData.curriculum.map((section, sectionIndex) => (
          <div key={sectionIndex} className="border p-4 rounded-lg space-y-4">
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => toggleExpanded("sections", sectionIndex)}
              >
                {expandedItems.sections.has(sectionIndex) ? (
                  <ChevronDown size={20} />
                ) : (
                  <ChevronRight size={20} />
                )}
                <input
                  type="text"
                  className="input input-bordered w-full font-semibold"
                  value={section.section}
                  placeholder="Enter Section Name"
                  onChange={(e) =>
                    curriculumOperations.updateSection(
                      sectionIndex,
                      "section",
                      e.target.value
                    )
                  }
                />
              </div>
              <button
                onClick={() => curriculumOperations.removeSection(sectionIndex)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>
            </div>

            {/* Lectures */}
            {expandedItems.sections.has(sectionIndex) && (
              <div className="space-y-4">
                {section.lectures.map((lecture, lectureIndex) => (
                  <div
                    key={lectureIndex}
                    className="border p-3 rounded-lg ml-6 space-y-3"
                  >
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() =>
                        toggleExpanded(
                          "lectures",
                          `${sectionIndex}-${lectureIndex}`
                        )
                      }
                    >
                      {expandedItems.lectures.has(
                        `${sectionIndex}-${lectureIndex}`
                      ) ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                      <span className="font-semibold">
                        Lecture {lectureIndex + 1}
                      </span>
                    </div>

                    {expandedItems.lectures.has(
                      `${sectionIndex}-${lectureIndex}`
                    ) && (
                      <div className="ml-6 space-y-4">
                        {/* Lecture Fields */}
                        <div className="space-y-3">
                          <input
                            type="text"
                            className="input input-bordered w-full"
                            value={lecture.title}
                            placeholder="Enter Lecture Title"
                            onChange={(e) =>
                              curriculumOperations.updateLecture(
                                sectionIndex,
                                lectureIndex,
                                "title",
                                e.target.value
                              )
                            }
                          />
                          <textarea
                            className="textarea textarea-bordered w-full"
                            value={lecture.description}
                            placeholder="Enter Lecture Description"
                            onChange={(e) =>
                              curriculumOperations.updateLecture(
                                sectionIndex,
                                lectureIndex,
                                "description",
                                e.target.value
                              )
                            }
                          />
                          <input
                            type="text"
                            disabled={true}
                            className="input input-bordered w-full"
                            value={lecture.duration}
                            placeholder="0"
                            onChange={(e) =>
                              curriculumOperations.updateLecture(
                                sectionIndex,
                                lectureIndex,
                                "duration",
                                e.target.value
                              )
                            }
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="toggle"
                              checked={lecture.preview}
                              onChange={(e) =>
                                curriculumOperations.updateLecture(
                                  sectionIndex,
                                  lectureIndex,
                                  "preview",
                                  e.target.checked
                                )
                              }
                            />
                            <span className="text-sm">Preview Available</span>
                          </div>
                        </div>

                        {/* Video Upload */}
                        {renderFileUpload(
                          "video",
                          ".mp4,.webm,.mov,.m4v",
                          sectionIndex,
                          lectureIndex
                        )}

                        {/* Remove Lecture */}
                        <button
                          className="btn btn-error btn-sm"
                          onClick={() =>
                            curriculumOperations.removeLecture(
                              sectionIndex,
                              lectureIndex
                            )
                          }
                        >
                          Remove Lecture
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Lecture Button */}
                <button
                  className="btn btn-primary w-full"
                  onClick={() => curriculumOperations.addLecture(sectionIndex)}
                >
                  <Plus size={16} className="mr-2" />
                  Add Lecture
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add Section Button */}
        <button
          className="btn btn-secondary w-full"
          onClick={curriculumOperations.addSection}
        >
          <Plus size={16} className="mr-2" />
          Add Section
        </button>
      </div>
    </div>
  );
};

export default CurriculumStep;
