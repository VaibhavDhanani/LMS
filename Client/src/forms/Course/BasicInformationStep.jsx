const BasicInformationStep = ({ formData, updateFormData }) => (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-base-content">Basic Information</h2>
        
        <div className="form-control">
            <label className="label">
                <span className="label-text text-base-content/80">Course Title</span>
            </label>
            <input
                type="text"
                placeholder="Enter course title"
                className="input input-bordered w-full bg-base-100 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20
                 transition-all duration-300"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
            />
        </div>
        
        <div className="form-control">
            <label className="label">
                <span className="label-text text-base-content/80">Subtitle</span>
            </label>
            <input
                type="text"
                placeholder="Enter course subtitle"
                className="input input-bordered w-full bg-base-100 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20
                 transition-all duration-300"
                value={formData.subtitle}
                onChange={(e) => updateFormData("subtitle", e.target.value)}
            />
        </div>
        
        <div className="form-control">
            <label className="label">
                <span className="label-text text-base-content/80">Description</span>
            </label>
            <textarea
                className="textarea textarea-bordered w-full min-h-32 bg-base-100 hover:border-primary focus:border-primary focus:ring-2 focus:ring-primary/20
                 transition-all duration-300 resize-y"
                placeholder="Enter course description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
            />
        </div>
    </div>
);

export default BasicInformationStep;