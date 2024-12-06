const LearnPointsStep = ({ formData, updateFormData }) => {
  const addLearnPoint = () => {
    updateFormData("learnPoints", [...formData.learnPoints, ""]);
  };

  const updateLearnPoint = (index, value) => {
    const updatedPoints = [...formData.learnPoints];
    updatedPoints[index] = value;
    updateFormData("learnPoints", updatedPoints);
  };

  const removeLearnPoint = (index) => {
    const updatedPoints = formData.learnPoints.filter((_, i) => i !== index);
    updateFormData("learnPoints", updatedPoints);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">What Will Students Learn?</h2>
      {formData.learnPoints.map((point, index) => (
        <div key={index} className="flex gap-2 items-center">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder={`Learn point ${index + 1}`}
            value={point}
            onChange={(e) => updateLearnPoint(index, e.target.value)}
          />
          <button
            className="btn btn-error btn-sm"
            onClick={() => removeLearnPoint(index)}
          >
            Remove
          </button>
        </div>
      ))}
      <button className="btn btn-primary" onClick={addLearnPoint}>
        Add Learn Point
      </button>
    </div>
  );
};

export default LearnPointsStep;
