import {useEffect} from "react";

const ReviewStep = ({ formData,updateFormData }) => {

    useEffect(() => {
        const calculateTotalMinutes = () => {
            return formData.curriculum.reduce((total, curriculum) => {
                const sectionMinutes = curriculum.lectures.reduce((lectureTotal, lecture) => {
                    return lectureTotal + (parseFloat(lecture.duration) || 0); // Convert duration to a number, default to 0 if invalid
                }, 0);
                return total + sectionMinutes;
            }, 0);
        };

        const totalMinutes = calculateTotalMinutes();

        updateFormData("details", {
            ...formData.details,
            totalMinutes,
        });
    }, [formData.curriculum]); // Dependency array to ensure this effect runs when `curriculum` or `details` change

    const SectionHeader = ({ title }) => (
        <h3 className="text-lg font-semibold border-b pb-2 mb-3">{title}</h3>
    );

    const InfoCard = ({ title, children, className = "" }) => (
        <div className={`bg-gray-50 rounded-lg p-4 shadow-sm ${className}`}>
            <SectionHeader title={title} />
            {children}
        </div>
    );

    const ListRenderer = ({ items, emptyText = "No items specified" }) => (
        <ul className="space-y-1 text-sm">
            {items?.length > 0 ? (
                items.map((item, index) => <li key={index} className="flex items-center">
                        <span className="mr-2 text-blue-500">•</span>
                        {item}
                    </li>
                )) : (
                <li className="text-gray-500">{emptyText}</li>
            )}
        </ul>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-6">
            <h2 className="text-3xl font-bold text-center mb-6">Course Review</h2>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <InfoCard title="Basic Information">
                    <p><strong>Title:</strong> {formData.title || "N/A"}</p>
                    <p><strong>Subtitle:</strong> {formData.subtitle || "N/A"}</p>
                    <p><strong>Instructor:</strong> {formData.instructor?.name || "N/A"}</p>
                </InfoCard>

                {/* Course Details */}
                <InfoCard title="Course Overview">
                    <p><strong>Total Minutes:</strong> {formData.details?.totalMinutes || "N/A"}</p>
                    <p><strong>Level:</strong> {formData.details?.level || "N/A"}</p>
                    <p><strong>Status:</strong> {formData.isActive ? "Active" : "Inactive"}</p>
                </InfoCard>

                {/* Learning Points */}
                <InfoCard title="What You'll Learn">
                    <ListRenderer items={formData.learnPoints} />
                </InfoCard>

                {/* Technologies */}
                <InfoCard title="Technologies">
                    <ListRenderer items={formData.technologies} />
                </InfoCard>
            </div>

            {/* Curriculum Preview */}
            <InfoCard title="Course Content" className="w-full">
                {formData.curriculum?.length > 0 ? (
                    <div className="space-y-3">
                        {formData.curriculum.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="bg-white rounded-lg p-3 border">
                                <h4 className="font-medium mb-2">
                                    Section {sectionIndex + 1}: {section.section}
                                </h4>
                                {section.lectures?.map((lecture, lectureIndex) => (
                                    <div
                                        key={lectureIndex}
                                        className="pl-4 py-2 border-l-2 text-sm"
                                    >
                                        <div>{lecture.title}</div>
                                        <div className="text-gray-500">
                                            {lecture.duration && `Duration: ${lecture.duration}`}
                                            {lecture.preview && <span className="ml-2 text-green-600">Preview</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500">No curriculum content</p>
                )}
            </InfoCard>

            {/* Pricing */}
            <InfoCard title="Pricing" className="w-full">
                <div className="flex justify-between">
                    <p><strong>Original Price:</strong> ₹{formData.pricing?.price || "N/A"}</p>
                    <p><strong>Discount:</strong> ₹{formData.pricing?.discount || "N/A"}</p>
                </div>
            </InfoCard>

            {/* Promotional Video */}
            {formData.promotionalVideo && (
                <InfoCard title="Promotional Video" className="w-full">
                    <video
                        controls
                        className="w-full rounded-lg"
                        poster={formData.thumbnail}
                    >
                        <source src={formData.promotionalVideo} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </InfoCard>
            )}
        </div>
    );
};
export default ReviewStep;