import React from "react";

// Reusable EditableList Component
const EditableList = ({ items, onAdd, onUpdate, onRemove, placeholder }) => {
  return (
    <div>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder={`${placeholder} ${index + 1}`}
            value={item}
            onChange={(e) => onUpdate(index, e.target.value)}
            aria-label={`${placeholder} ${index + 1}`}
          />
          <button
            className="btn btn-error btn-sm"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${placeholder.toLowerCase()} ${index + 1}`}
          >
            Remove
          </button>
        </div>
      ))}
      <button
        className="btn btn-primary mt-2"
        onClick={onAdd}
        aria-label={`Add ${placeholder.toLowerCase()}`}
      >
        Add {placeholder}
      </button>
    </div>
  );
};

// Main Component
const TargetStudentsStep = ({ formData, updateFormData }) => {
  // Add, Update, Remove functions for Target Students
  const addTargetStudent = () => {
    if (formData.targetStudents.some((student) => student.trim() === "")) {
      alert("Please fill in all target students before adding more.");
      return;
    }
    updateFormData("targetStudents", [...formData.targetStudents, ""]);
  };

  const updateTargetStudent = (index, value) => {
    const updatedStudents = [...formData.targetStudents];
    updatedStudents[index] = value;
    updateFormData("targetStudents", updatedStudents);
  };

  const removeTargetStudent = (index) => {
    if (window.confirm("Are you sure you want to remove this entry?")) {
      const updatedStudents = formData.targetStudents.filter((_, i) => i !== index);
      updateFormData("targetStudents", updatedStudents);
    }
  };

  // Add, Update, Remove functions for Topics
  const addTopic = () => {
    if (formData.topics.some((topic) => topic.trim() === "")) {
      alert("Please fill in all topics before adding more.");
      return;
    }
    updateFormData("topics", [...formData.topics, ""]);
  };

  const updateTopic = (index, value) => {
    const updatedTopics = [...formData.topics];
    updatedTopics[index] = value;
    updateFormData("topics", updatedTopics);
  };

  const removeTopic = (index) => {
    if (window.confirm("Are you sure you want to remove this entry?")) {
      const updatedTopics = formData.topics.filter((_, i) => i !== index);
      updateFormData("topics", updatedTopics);
    }
  };

  return (
    <div className="space-y-6">
      {/* Target Students Section */}
      <h2 className="text-xl font-bold">Who is this course for?</h2>
      <EditableList
        items={formData.targetStudents}
        onAdd={addTargetStudent}
        onUpdate={updateTargetStudent}
        onRemove={removeTargetStudent}
        placeholder="Target Student"
      />

      {/* Topics Section */}
      <h2 className="text-xl font-bold mt-6">Course Topics</h2>
      <EditableList
        items={formData.topics}
        onAdd={addTopic}
        onUpdate={updateTopic}
        onRemove={removeTopic}
        placeholder="Topic"
      />
    </div>
  );
};

export default TargetStudentsStep;
