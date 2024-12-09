const BasicInformationStep = ({ formData, updateFormData }) => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Basic Information</h2>
      <div className="form-control">
        <label className="label">Course Title</label>
        <input
          type="text"
          placeholder="Enter course title"
          className="input input-bordered"
          value={formData.title}
          onChange={(e) => updateFormData("title", e.target.value)}
        />
      </div>
      <div className="form-control">
        <label className="label">Subtitle</label>
        <input
          type="text"
          placeholder="Enter course subtitle"
          className="input input-bordered"
          value={formData.subtitle}
          onChange={(e) => updateFormData("subtitle", e.target.value)}
        />
      </div>
      <div className="form-control">
        <label className="label">Description</label>
        <textarea
          className="textarea textarea-bordered"
          placeholder="Enter course description"
          value={formData.description}
          onChange={(e) => updateFormData("description", e.target.value)}
        />
      </div>
    </div>
  );
  
  export default BasicInformationStep;
  