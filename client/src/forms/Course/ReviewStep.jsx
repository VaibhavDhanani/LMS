import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, EyeOff } from "lucide-react";

const ReviewStep = ({ formData, updateFormData }) => {
    const [showVideo, setShowVideo] = useState(false);
    
    // Calculate final price after discount
    const calculateFinalPrice = () => {
        if (formData.pricing?.discountEnabled && formData.pricing?.price) {
            const discountAmount = (formData.pricing.discount / 100) * formData.pricing.price;
            return formData.pricing.price - discountAmount;
        }
        return formData.pricing?.price || 0;
    };
    
    const finalPrice = calculateFinalPrice();
    
    // Calculate total minutes of curriculum content
    useEffect(() => {
        const calculateTotalMinutes = () => {
            return formData.curriculum.reduce((total, curriculum) => {
                const sectionMinutes = curriculum.lectures.reduce((lectureTotal, lecture) => {
                    return lectureTotal + (parseFloat(lecture.duration) || 0);
                }, 0);
                return total + sectionMinutes;
            }, 0);
        };
        
        const totalMinutes = calculateTotalMinutes();
        
        updateFormData("details", {
            ...formData.details,
            totalMinutes,
        });
    }, [formData.curriculum]);
    
    // UI Components
    const SectionHeader = ({ title }) => (
        <h3 className="text-lg font-semibold border-b pb-2 mb-3">{title}</h3>
    );
    
    const InfoCard = ({ title, children, className = "" }) => (
        <Card className={`bg-base-100 shadow-lg border ${className}`}>
            <CardHeader className="bg-primary text-white rounded-t-lg px-6 py-4">
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-2">{children}</CardContent>
        </Card>
    );
    
    const ListRenderer = ({ items, emptyText = "No items specified" }) => (
        <ul className="space-y-1 text-sm">
            {items?.length > 0 ? (
                items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        <span className="mr-2 text-primary">•</span>
                        {item}
                    </li>
                ))
            ) : (
                <li className="text-gray-500">{emptyText}</li>
            )}
        </ul>
    );
    
    return (
        <div className="max-w-5xl mx-auto space-y-8 p-6">
            <h2 className="text-3xl font-bold text-center text-primary">📚 Course Review</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
                {/* Basic Information */}
                <InfoCard title="Basic Information">
                    <p><strong>Title:</strong> {formData.title || "N/A"}</p>
                    <p><strong>Subtitle:</strong> {formData.subtitle || "N/A"}</p>
                    <p><strong>Instructor:</strong> {formData.instructor?.name || "N/A"}</p>
                </InfoCard>
                
                {/* Course Details */}
                <InfoCard title="Course Overview">
                    <p><strong>Total Minutes:</strong> {formData.details?.totalMinutes || "N/A"} mins</p>
                    <p><strong>Level:</strong> {formData.details?.level || "N/A"}</p>
                    <p><strong>Status:</strong> <span className={`badge ${formData.isActive ? "badge-success" : "badge-error"}`}>{formData.isActive ? "Active" : "Inactive"}</span></p>
                </InfoCard>
                
                {/* Learning Points */}
                <InfoCard title="What You'll Learn">
                    <ListRenderer items={formData.learnPoints} />
                </InfoCard>
                
                {/* Technologies */}
                <InfoCard title="Technologies Used">
                    <ListRenderer items={formData.technologies} />
                </InfoCard>
            </div>
            
            {/* Curriculum Preview */}
            <InfoCard title="Course Content" className="w-full">
                {formData.curriculum?.length > 0 ? (
                    <div className="space-y-4">
                        {formData.curriculum.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="bg-white rounded-lg p-4 border border-gray-200 shadow-md">
                                <h4 className="font-semibold text-lg mb-2">
                                    Section {sectionIndex + 1}: {section.section}
                                </h4>
                                {section.lectures?.map((lecture, lectureIndex) => (
                                    <div key={lectureIndex} className="pl-4 py-2 border-l-2 border-primary text-sm">
                                        <div className="font-medium">{lecture.title}</div>
                                        <div className="text-gray-500">
                                            {lecture.duration && `Duration: ${lecture.duration} mins`}
                                            {lecture.preview && <span className="ml-2 badge badge-primary">Preview</span>}
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
            <InfoCard title="Pricing">
                <div className="grid grid-cols-3 text-center font-medium">
                    <p>💰 Original Price: <span className="text-gray-700">₹{formData.pricing?.price || "N/A"}</span></p>
                    <p>🎯 Discount: <span className="text-green-600">{formData.pricing?.discount || "N/A"}{formData.pricing?.discount ? "%" : ""}</span></p>
                    <p>🔥 Final Price: <span className="text-primary font-bold">₹{finalPrice}</span></p>
                </div>
            </InfoCard>
            
            {/* Promotional Video with Preview Button */}
            {formData.promotionalVideo && (
                <InfoCard title="Promotional Video" className="">
                    <div className="text-center">
                        <Button
                            className="btn btn-primary mb-4 flex items-center gap-2"
                            onClick={() => setShowVideo(!showVideo)}
                        >
                            {showVideo ? <EyeOff className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                            {showVideo ? "Hide Preview" : "Show Preview"}
                        </Button>
                        
                        {/* Ensure consistent video size */}
                        <div className="relative w-full max-w-3xl mx-auto">
                            {showVideo && (
                                <video
                                    controls
                                    className="w-full h-auto max-h-[500px] aspect-video rounded-lg shadow-lg"
                                    poster={formData.thumbnail}
                                    onContextMenu={(e) => e.preventDefault()} // Disable right-click
                                >
                                    <source src={formData.promotionalVideo} type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>
                            )}
                        </div>
                    </div>
                </InfoCard>
            )}
        
        </div>
    );
};

export default ReviewStep;
