const TargetStudentsStep = ({ formData, updateFormData }) => {
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

  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default TargetStudentsStep;
