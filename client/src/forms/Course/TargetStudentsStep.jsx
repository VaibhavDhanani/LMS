const TargetStudentsStep = ({ formData, updateFormData }) => {
  // Functions for Target Students
  const addTargetStudent = () => {
    updateFormData("targetStudents", [...formData.targetStudents, ""]);
  };

  const updateTargetStudent = (index, value) => {
    const updatedStudents = [...formData.targetStudents];
    updatedStudents[index] = value;
    updateFormData("targetStudents", updatedStudents);
  };

  const removeTargetStudent = (index) => {
    const updatedStudents = formData.targetStudents.filter(
      (_, i) => i !== index
    );
    updateFormData("targetStudents", updatedStudents);
  };

  // Functions for Topics
  const addTopic = () => {
    updateFormData("topics", [...formData.topics, ""]);
  };

  const updateTopic = (index, value) => {
    const updatedTopics = [...formData.topics];
    updatedTopics[index] = value;
    updateFormData("topics", updatedTopics);
  };

  const removeTopic = (index) => {
    const updatedTopics = formData.topics.filter((_, i) => i !== index);
    updateFormData("topics", updatedTopics);
  };

  return (
    <div className="space-y-6">
      {/* Target Students Section */}
      <h2 className="text-xl font-bold">Who is this course for?</h2>
      {formData.targetStudents.map((student, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder={`Target Student ${index + 1}`}
            value={student}
            onChange={(e) => updateTargetStudent(index, e.target.value)}
          />
          <button
            className="btn btn-error btn-sm"
            onClick={() => removeTargetStudent(index)}
          >
            Remove
          </button>
        </div>
      ))}
      <button className="btn btn-primary" onClick={addTargetStudent}>
        Add Target Student
      </button>

      {/* Topics Section */}
      <h2 className="text-xl font-bold mt-6">Course Topics</h2>
      {formData.topics.map((topic, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder={`Topic ${index + 1}`}
            value={topic}
            onChange={(e) => updateTopic(index, e.target.value)}
          />
          <button
            className="btn btn-error btn-sm"
            onClick={() => removeTopic(index)}
          >
            Remove
          </button>
        </div>
      ))}
      <button className="btn btn-primary" onClick={addTopic}>
        Add Topic
      </button>
    </div>
  );
};

export default TargetStudentsStep;
