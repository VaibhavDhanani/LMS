const PrerequisitesStep = ({ formData, updateFormData }) => {
  const addPrerequisite = () => {
    updateFormData("prerequisites", [...formData.prerequisites, ""]);
  };

  const updatePrerequisite = (index, value) => {
    const updatedPrereqs = [...formData.prerequisites];
    updatedPrereqs[index] = value;
    updateFormData("prerequisites", updatedPrereqs);
  };

  const removePrerequisite = (index) => {
    const updatedPrereqs = formData.prerequisites.filter((_, i) => i !== index);
    updateFormData("prerequisites", updatedPrereqs);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Prerequisites</h2>
      {formData.prerequisites.map((prerequisite, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder={`Prerequisite ${index + 1}`}
            value={prerequisite}
            onChange={(e) => updatePrerequisite(index, e.target.value)}
          />
          <button
            className="btn btn-error btn-sm"
            onClick={() => removePrerequisite(index)}
          >
            Remove
          </button>
        </div>
      ))}
      <button className="btn btn-primary" onClick={addPrerequisite}>
        Add Prerequisite
      </button>
    </div>
  );
};

export default PrerequisitesStep;
