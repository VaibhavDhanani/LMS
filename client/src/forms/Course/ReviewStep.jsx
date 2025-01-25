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
                    <p><span className="font-medium">Instructor:</span> {formData.instructor?.name || "N/A"}</p>
                </div>
            </div>

            {/* Instructor Details */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Instructor Information</h3>
                <div className="grid gap-2">
                    <p><span className="font-medium">Title:</span> {formData.instructor?.title || "N/A"}</p>
                    <p><span className="font-medium">Rating:</span> {formData.instructor?.rating || "N/A"}</p>
                    <p><span className="font-medium">Total Students:</span> {formData.instructor?.totalStudents || "N/A"}</p>
                    <p><span className="font-medium">Bio:</span> {formData.instructor?.bio || "N/A"}</p>
                </div>
            </div>

            {/* Course Details */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Course Details</h3>
                <div className="grid gap-2">
                    <p><span className="font-medium">Total Hours:</span> {formData.details?.totalHours || "N/A"}</p>
                    <p><span className="font-medium">Total Lectures:</span> {formData.details?.lectures || "N/A"}</p>
                    <p><span className="font-medium">Level:</span> {formData.details?.level || "N/A"}</p>
                    <p><span className="font-medium">Last Updated:</span> {formData.details?.lastUpdated?.toLocaleDateString() || "N/A"}</p>
                </div>
            </div>

            {/* What You'll Learn */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">What You'll Learn</h3>
                <ul className="list-disc pl-5 space-y-1">
                    {formData.whatYouWillLearn?.length > 0 ? (
                        formData.whatYouWillLearn.map((point, index) => (
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
                    {formData.whichTechStackYouwillLearn?.length > 0 ? (
                        formData.whichTechStackYouwillLearn.map((tech, index) => (
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

            {/* Pricing */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Pricing</h3>
                <div className="grid gap-2">
                    <p><span className="font-medium">Original Price:</span> ₹{formData.price?.original || "N/A"}</p>
                    <p><span className="font-medium">Discounted Price:</span> ₹{formData.price?.discounted || "N/A"}</p>
                </div>
            </div>

            {/* Course Status */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Course Status</h3>
                <div className="grid gap-2">
                    <p><span className="font-medium">Status:</span> {formData.isActive ? "Active" : "Inactive"}</p>
                    {/* <p><span className="font-medium">Created At:</span> {formData.createdAt?.toLocaleDateString() || "N/A"}</p> */}
                    <p><span className="font-medium">Rating:</span> {formData.rating || "N/A"}</p>
                </div>
            </div>

            {/* Reviews */}
            <div className="space-y-3">
                <h3 className="text-lg font-semibold">Reviews</h3>
                {formData.reviews?.length > 0 ? (
                    <div className="space-y-4">
                        {formData.reviews.map((review, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-medium">{review.userName}</p>
                                    <p className="text-yellow-500">Rating: {review.rating}/5</p>
                                </div>
                                <p className="text-gray-600">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No reviews available</p>
                )}
            </div>

            {/* Media Preview */}
            {(formData.videos?.length > 0) && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Course Videos</h3>
                    <div className="grid gap-4">
                        {formData.videos.map((videoUrl, index) => (
                            <div key={index}>
                                <video
                                    className="w-full max-w-md rounded-lg"
                                    controls
                                >
                                    <source src={videoUrl} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Materials */}
            {(formData.materials?.length > 0) && (
                <div className="space-y-3">
                    <h3 className="text-lg font-semibold">Course Materials</h3>
                    <ul className="list-disc pl-5 space-y-1">
                        {formData.materials.map((material, index) => (
                            <li key={index}>
                                <a 
                                    href={material} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-blue-600 hover:underline"
                                >
                                    Material {index + 1}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ReviewStep;