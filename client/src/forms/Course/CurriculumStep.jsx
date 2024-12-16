import { useState } from 'react';
import { storage, ref, uploadBytes, getDownloadURL } from '../../apis/firebase.config.js'; // Adjust path to your firebase-config file

const CurriculumStep = ({ formData, updateFormData }) => {
  const [expandedIndex, setExpandedIndex] = useState(null); // To manage which lecture is expanded

  // Add Lecture after a specific index
  const addLecture = (index) => {
    const updatedCurriculum = [...formData.curriculum];
    updatedCurriculum.splice(index + 1, 0, {
      title: "",
      description: "",
      video: null,
      isPreviewAvailable: false,
      thumbnail: null,
      promotionalVideo: null
    });
    updateFormData("curriculum", updatedCurriculum);
  };

  // Update Lecture Details and upload files to Firebase Storage
  const updateLecture = (index, key, value) => {
    const updatedCurriculum = [...formData.curriculum];

    // Add validation logic
    if (key === "title" && value.length > 100) {
      alert("Title must be under 100 characters");
      return;
    }

    if (key === "video" || key === "thumbnail" || key === "promotionalVideo") {
      const file = value[0];
      if (key === "video" && file.size > 5 * 1024 * 1024) { // 5 MB size limit for video
        alert("Video size must be under 5MB");
        return;
      }

      const storageRef = ref(storage, `${key}s/${file.name}`);
      uploadBytes(storageRef, file).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((url) => {
          updatedCurriculum[index][key] = url; // Update the formData with the uploaded URL
          updateFormData("curriculum", updatedCurriculum); // Update the parent form data
        });
      });
    } else {
      updatedCurriculum[index][key] = value; // For non-file fields
      updateFormData("curriculum", updatedCurriculum); // Update the parent form data
    }
  };

  // Toggle expand/collapse for a particular lecture
  const toggleLectureDetails = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Remove Lecture
  const removeLecture = (index) => {
    const updatedCurriculum = formData.curriculum.filter((_, i) => i !== index);
    updateFormData("curriculum", updatedCurriculum);
  };

  return (
    <div className="space-y-6">
      {/* Total Lectures Title */}
      <div>
        <h2 className="text-2xl font-bold">Curriculum</h2>
      </div>

      {/* Thumbnail Upload */}
      <div>
        <h3 className="text-lg font-bold">Course Thumbnail</h3>
        <input
          type="file"
          className="file-input file-input-bordered"
          onChange={(e) => updateFormData("thumbnail", e.target.files[0])}
        />
        {formData.thumbnail && (
          <img
            src={formData.thumbnail}
            alt="Thumbnail Preview"
            className="mt-2 w-32 h-32 object-cover"
          />
        )}
      </div>

      {/* Promotional Video Upload */}
      <div>
        <h3 className="text-lg font-bold">Promotional Video</h3>
        <input
          type="file"
          className="file-input file-input-bordered"
          onChange={(e) => updateFormData("promotionalVideo", e.target.files[0])}
        />
        {formData.promotionalVideo && (
          <video width="320" height="240" controls>
            <source src={formData.promotionalVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>

      {/* Curriculum Section */}
      <h2 className="text-xl font-bold mt-6">Total Lectures: {formData.curriculum.length}</h2>
      {formData.curriculum.map((lesson, index) => (
        <div
          key={index}
          className="border-2 p-4 rounded-lg relative space-y-4"
        >
          {/* Section Title (Clickable) */}
          <div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => toggleLectureDetails(index)}
          >
            <span className="text-lg font-semibold">Lecture {index + 1}</span>
          </div>

          {/* Expandable Lecture Details */}
          {expandedIndex === index && (
            <div className="space-y-4 pl-4">
              {/* Lesson Title */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold">Lesson Title</label>
                <input
                  type="text"
                  className="input input-bordered"
                  placeholder="Lesson Title"
                  value={lesson.title}
                  onChange={(e) => updateLecture(index, "title", e.target.value)}
                />
              </div>

              {/* Lesson Description */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold">Lesson Description</label>
                <textarea
                  className="textarea textarea-bordered"
                  placeholder="Lesson Description"
                  value={lesson.description}
                  onChange={(e) => updateLecture(index, "description", e.target.value)}
                ></textarea>
              </div>

              {/* Video Upload */}
              <div className="flex flex-col">
                <label className="text-sm font-semibold">Upload Video</label>
                <input
                  type="file"
                  className="file-input file-input-bordered"
                  onChange={(e) => updateLecture(index, "video", e.target.files[0])}
                />
                {lesson.video && (
                  <video width="320" height="240" controls>
                    <source src={lesson.video} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              {/* Preview Toggle (Switch) */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold">Available for Preview</label>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Preview Available</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={lesson.isPreviewAvailable}
                      onChange={() =>
                        updateLecture(index, "isPreviewAvailable", !lesson.isPreviewAvailable)
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Remove Button */}
              <button
                className="btn btn-error btn-sm"
                onClick={() => removeLecture(index)}
              >
                Remove Lesson
              </button>
            </div>
          )}

          {/* + Icon to Add Lecture After This */}
          <div
            className="absolute bottom-4 right-4 p-2 bg-blue-500 text-white rounded-full cursor-pointer"
            onClick={() => addLecture(index)}
          >
            +
          </div>
        </div>
      ))}

      {/* Add New Lecture Button */}
      <button
        className="btn btn-secondary mt-4"
        onClick={() => addLecture(formData.curriculum.length)}
      >
        Add New Lecture
      </button>
    </div>
  );
};

export default CurriculumStep;
