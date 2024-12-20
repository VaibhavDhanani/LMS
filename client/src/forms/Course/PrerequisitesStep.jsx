import { useCallback } from "react";

const PrerequisitesStep = ({ formData, updateFormData }) => {
  // Functions for Prerequisites
  const addPrerequisite = useCallback(() => {
    if (!formData.prerequisites.includes("") && !formData.prerequisites.some(item => item === "")) {
      updateFormData("prerequisites", [...formData.prerequisites, ""]);
    }
  }, [formData, updateFormData]);

  const updatePrerequisite = useCallback((index, value) => {
    const updatedPrereqs = [...formData.prerequisites];
    updatedPrereqs[index] = value;
    updateFormData("prerequisites", updatedPrereqs);
  }, [formData, updateFormData]);

  const removePrerequisite = useCallback((index) => {
    const updatedPrereqs = formData.prerequisites.filter((_, i) => i !== index);
    updateFormData("prerequisites", updatedPrereqs);
  }, [formData, updateFormData]);

  // Functions for Requirements (similar logic)
  const addRequirement = useCallback(() => {
    if (!formData.requirements.includes("") && !formData.requirements.some(item => item === "")) {
      updateFormData("requirements", [...formData.requirements, ""]);
    }
  }, [formData, updateFormData]);

  const updateRequirement = useCallback((index, value) => {
    const updatedReqs = [...formData.requirements];
    updatedReqs[index] = value;
    updateFormData("requirements", updatedReqs);
  }, [formData, updateFormData]);

  const removeRequirement = useCallback((index) => {
    const updatedReqs = formData.requirements.filter((_, i) => i !== index);
    updateFormData("requirements", updatedReqs);
  }, [formData, updateFormData]);

  return (
    <div className="space-y-6">
      {/* Prerequisites Section */}
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

      {/* Requirements Section */}
      <h2 className="text-xl font-bold mt-6">Requirements</h2>
      {formData.requirements.map((requirement, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder={`Requirement ${index + 1}`}
            value={requirement}
            onChange={(e) => updateRequirement(index, e.target.value)}
          />
          <button
            className="btn btn-error btn-sm"
            onClick={() => removeRequirement(index)}
          >
            Remove
          </button>
        </div>
      ))}
      <button className="btn btn-primary" onClick={addRequirement}>
        Add Requirement
      </button>
    </div>
  );
};

export default PrerequisitesStep;
