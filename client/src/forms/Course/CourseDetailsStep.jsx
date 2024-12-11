const CourseDetailsStep = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Course Details</h2>

      {/* Course Level */}
      <div className="form-control">
        <label className="label font-medium">Course Level</label>
        <select
          className="select select-bordered w-full"
          value={formData.details.level}
          onChange={(e) =>
            updateFormData("details", {
              ...formData.details,
              level: e.target.value,
            })
          }
        >
          <option value="">Select Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      {/* Total Hours */}
      <div className="form-control">
        <label className="label font-medium">Total Hours</label>
        <input
          type="number"
          className="input input-bordered w-full"
          placeholder="e.g., 40"
          value={formData.details.totalHours}
          onChange={(e) =>
            updateFormData("details", {
              ...formData.details,
              totalHours: e.target.value,
            })
          }
        />
      </div>

      {/* Course Language */}
      <div className="form-control">
        <label className="label font-medium">Language</label>
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="e.g., English"
          value={formData.details.language || ""}
          onChange={(e) =>
            updateFormData("details", {
              ...formData.details,
              language: e.target.value,
            })
          }
        />
      </div>
    </div>
  );
};

export default CourseDetailsStep;
