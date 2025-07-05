const CourseDetailsStep = ({ formData, updateFormData }) => {
    const details = formData.details;
    
    return (
        <div className="space-y-8">
            <div className="flex items-center space-x-3 pb-4 border-b border-base-300">
                <h2 className="text-2xl font-bold text-base-content">Course Details</h2>
                <div className="badge badge-primary">Step 2</div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                {/* Course Level */}
                <div className="form-control w-full">
                    <label htmlFor="course-level" className="label">
                        <span className="label-text text-base-content/80 font-medium">Course Level</span>
                    </label>
                    <select
                        id="course-level"
                        className="select select-bordered w-full bg-base-100
                     hover:border-primary focus:border-primary
                     transition-all duration-300"
                        value={details.level}
                        onChange={(e) =>
                            updateFormData("details", {
                                ...details,
                                level: e.target.value,
                            })
                        }
                    >
                        <option value="" disabled>Select Level</option>
                        <option value="Beginner" className="py-2">Beginner</option>
                        <option value="Intermediate" className="py-2">Intermediate</option>
                        <option value="Advanced" className="py-2">Advanced</option>
                    </select>
                    <label className="label">
            <span className="label-text-alt text-base-content/60">
              Choose the difficulty level of your course
            </span>
                    </label>
                </div>
                
                {/* Course Language */}
                <div className="form-control w-full">
                    <label htmlFor="course-language" className="label">
                        <span className="label-text text-base-content/80 font-medium">Language</span>
                    </label>
                    <input
                        id="course-language"
                        type="text"
                        className="input input-bordered w-full bg-base-100
                     hover:border-primary focus:border-primary focus:ring-2
                     focus:ring-primary/20 transition-all duration-300"
                        placeholder="e.g., English"
                        value={details.language || ""}
                        onChange={(e) =>
                            updateFormData("details", {
                                ...details,
                                language: e.target.value,
                            })
                        }
                    />
                    <label className="label">
            <span className="label-text-alt text-base-content/60">
              Primary language of instruction
            </span>
                    </label>
                </div>
                
                {/* <div className="form-control w-full">
                    <label htmlFor="total-hours" className="label">
                        <span className="label-text text-base-content/80 font-medium">Total Hours</span>
                    </label>
                    <input
                        id="total-hours"
                        type="number"
                        className="input input-bordered w-full bg-base-100
                     hover:border-primary focus:border-primary focus:ring-2
                     focus:ring-primary/20 transition-all duration-300"
                        placeholder="e.g., 10"
                        value={details.totalHours || ""}
                        onChange={(e) =>
                            updateFormData("details", {
                                ...details,
                                totalHours: e.target.value,
                            })
                        }
                    />
                    <label className="label">
            <span className="label-text-alt text-base-content/60">
              Approximate course duration in hours
            </span>
                    </label>
                </div> */}
                
                {/* Number of Lectures */}
                {/* <div className="form-control w-full">
                    <label htmlFor="total-lectures" className="label">
                        <span className="label-text text-base-content/80 font-medium">Number of Lectures</span>
                    </label>
                    <input
                        id="total-lectures"
                        type="number"
                        className="input input-bordered w-full bg-base-100
                     hover:border-primary focus:border-primary focus:ring-2
                     focus:ring-primary/20 transition-all duration-300"
                        placeholder="e.g., 45"
                        value={details.lectures || ""}
                        onChange={(e) =>
                            updateFormData("details", {
                                ...details,
                                lectures: e.target.value,
                            })
                        }
                    />
                    <label className="label">
            <span className="label-text-alt text-base-content/60">
              Total number of course lectures
            </span>
            </label>
            </div> */}
            
            </div>
            
            <div className="alert alert-info bg-info/10 text-info mt-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <div>
                    <h3 className="font-bold">Pro Tip</h3>
                    <p>Providing accurate course details helps students make informed decisions.</p>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailsStep;