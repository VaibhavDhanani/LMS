const ReviewStep = ({ formData }) => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review Your Course</h2>

            {/* Basic Information */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid gap-2">
                    <p><span className="font-medium">Title:</span> {formData.title || "N/A"}</p>
                    <p><span className="font-medium">Subtitle:</span> {formData.subtitle || "N/A"}</p>
                    <p><span className="font-medium">Description:</span> {formData.description || "N/A"}</p>
                    <p><span className="font-medium">Instructor:</span> {formData.instructor || "N/A"}</p>
                </div>
            </div>

            {/* Course Details */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Course Details</h3>
                <div className="grid gap-2">
                    <p><span className="font-medium">Total Hours:</span> {formData.details?.totalHours || "N/A"}</p>
                    <p><span className="font-medium">Total Lectures:</span> {formData.details?.lectures || "N/A"}</p>
                    <p><span className="font-medium">Level:</span> {formData.details?.level || "N/A"}</p>
                </div>
            </div>

            {/* What You'll Learn */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">What You'll Learn</h3>
                <ul className="list-disc pl-5 space-y-1">
                    {formData.learnPoints?.length > 0 ? (
                        formData.learnPoints.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))
                    ) : (
                        <li className="text-gray-500">No learning points specified</li>
                    )}
                </ul>
            </div>

            {/* Technologies */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Technologies Covered</h3>
                <ul className="list-disc pl-5 space-y-1">
                    {formData.technologies?.length > 0 ? (
                        formData.technologies.map((tech, index) => (
                            <li key={index}>{tech}</li>
                        ))
                    ) : (
                        <li className="text-gray-500">No technologies specified</li>
                    )}
                </ul>
            </div>

            {/* Prerequisites */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Prerequisites</h3>
                <ul className="list-disc pl-5 space-y-1">
                    {formData.prerequisites?.length > 0 ? (
                        formData.prerequisites.map((prerequisite, index) => (
                            <li key={index}>{prerequisite}</li>
                        ))
                    ) : (
                        <li className="text-gray-500">No prerequisites specified</li>
                    )}
                </ul>
            </div>

            {/* Requirements */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Requirements</h3>
                <ul className="list-disc pl-5 space-y-1">
                    {formData.requirements?.length > 0 ? (
                        formData.requirements.map((requirement, index) => (
                            <li key={index}>{requirement}</li>
                        ))
                    ) : (
                        <li className="text-gray-500">No requirements specified</li>
                    )}
                </ul>
            </div>

            {/* Course Content */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Course Content</h3>
                {formData.curriculum?.length > 0 ? (
                    <div className="space-y-4">
                        {formData.curriculum.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="border rounded-lg p-4">
                                <h4 className="font-medium mb-3">
                                    Section {sectionIndex + 1}: {section.section}
                                </h4>
                                <div className="space-y-2 ml-4">
                                    {section.lectures?.map((lecture, lectureIndex) => (
                                        <div key={lectureIndex} className="border-l-2 border-gray-200 pl-4 py-2">
                                            <div className="font-medium">
                                                Lecture {lectureIndex + 1}: {lecture.title}
                                            </div>
                                            {lecture.description && (
                                                <p className="text-gray-600 text-sm mt-1">{lecture.description}</p>
                                            )}
                                            <div className="flex gap-3 mt-2 text-sm text-gray-500">
                                                {lecture.duration && (
                                                    <span>Duration: {lecture.duration}</span>
                                                )}
                                                {lecture.preview && (
                                                    <span className="text-green-600">Preview Available</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No curriculum content available</p>
                )}
            </div>

            {/* Target Students */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Target Students</h3>
                <ul className="list-disc pl-5 space-y-1">
                    {formData.targetStudents?.length > 0 ? (
                        formData.targetStudents.map((student, index) => (
                            <li key={index}>{student}</li>
                        ))
                    ) : (
                        <li className="text-gray-500">No target students specified</li>
                    )}
                </ul>
            </div>

            {/* Topics */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Topics</h3>
                <ul className="list-disc pl-5 space-y-1">
                    {formData.topics?.length > 0 ? (
                        formData.topics.map((topic, index) => (
                            <li key={index}>{topic}</li>
                        ))
                    ) : (
                        <li className="text-gray-500">No topics specified</li>
                    )}
                </ul>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Pricing</h3>
                <div className="grid gap-2">
                    <p><span className="font-medium">Price:</span> ${formData.pricing?.price || "N/A"}</p>
                    {formData.pricing?.discountEnabled && (
                        <p><span className="font-medium">Discount:</span> ${formData.pricing.discount}</p>
                    )}
                </div>
            </div>

            {/* Course Status */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Course Status</h3>
                <div className="grid gap-2">
                    <p><span className="font-medium">Status:</span> {formData.isActive ? "Active" : "Inactive"}</p>
                    <p><span className="font-medium">Last Updated:</span> {formData.lastUpdated || "N/A"}</p>
                    <p><span className="font-medium">Created At:</span> {formData.createdAt || "N/A"}</p>
                </div>
            </div>

            {/* Media Preview */}
            {(formData.thumbnail || formData.promotionalVideo) && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Media</h3>
                    <div className="grid gap-4">
                        {formData.thumbnail && (
                            <div>
                                <p className="font-medium mb-2">Thumbnail:</p>
                                <img
                                    src={formData.thumbnail}
                                    alt="Course Thumbnail"
                                    className="w-48 h-48 object-cover rounded-lg"
                                />
                            </div>
                        )}
                        {formData.promotionalVideo && (
                            <div>
                                <p className="font-medium mb-2">Promotional Video:</p>
                                <video
                                    className="w-full max-w-md rounded-lg"
                                    controls
                                >
                                    <source src={formData.promotionalVideo} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewStep;