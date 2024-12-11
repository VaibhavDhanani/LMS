import { useState } from 'react';

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
    });
    updateFormData("curriculum", updatedCurriculum);
  };

  // Update Lecture Details
  const updateLecture = (index, key, value) => {
    const updatedCurriculum = [...formData.curriculum];
    updatedCurriculum[index][key] = value;
    updateFormData("curriculum", updatedCurriculum);
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
      </div>

      {/* Promotional Video Upload */}
      <div>
        <h3 className="text-lg font-bold">Promotional Video</h3>
        <input
          type="file"
          className="file-input file-input-bordered"
          onChange={(e) => updateFormData("promotionalVideo", e.target.files[0])}
        />
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

      {/* Add Lecture Button */}
      <button className="btn btn-primary mt-4" onClick={() => addLecture(formData.curriculum.length - 1)}>
        Add Lecture at the End
      </button>
    </div>
  );
};

export default CurriculumStep;
