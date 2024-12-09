const CourseDetailsStep = ({ formData, updateFormData }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Course Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="form-control">
          <label className="label">Total Hours</label>
          <input
            type="number"
            className="input input-bordered"
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
        <div className="form-control">
          <label className="label">Number of Lectures</label>
          <input
            type="number"
            className="input input-bordered"
            placeholder="e.g., 15"
            value={formData.details.lectures}
            onChange={(e) =>
              updateFormData("details", {
                ...formData.details,
                lectures: e.target.value,
              })
            }
          />
        </div>
        <div className="form-control">
          <label className="label">Course Level</label>
          <select
            className="select select-bordered"
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
        <div className="form-control">
          <label className="label">Last Updated</label>
          <input
            type="date"
            className="input input-bordered"
            value={formData.details.lastUpdated}
            onChange={(e) =>
              updateFormData("details", {
                ...formData.details,
                lastUpdated: e.target.value,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default CourseDetailsStep;
