import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormSidebar from "./FormSidebar";
import BasicInformationStep from "./BasicInformationStep";
import PricingStep from "./PricingStep";
import CourseDetailsStep from "./CourseDetailsStep";
import LearnPointsStep from "./LearnPointStep";
import PrerequisitesStep from "./PrerequisitesStep";
import CurriculumStep from "./CurriculumStep";
import TargetStudentsStep from "./TargetStudentsStep";
import ReviewStep from "./ReviewStep";
import { getCourseById, updateCourse } from "../../services/course.service.jsx";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
const CourseForm = () => {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const {user ,token} =useAuth();
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    instructor: "",
    details: { totalHours: "", lectures: "", level: "" },
    learnPoints: [""],
    technologies: [""],
    prerequisites: [""],
    requirements: [""],
    thumbnail: "",
    promotionalVideo: "",
    lectures: [{ title: "", description: "", videoUrl: "",thumbnailUrl: "" , duration: "", preview: false }],
    targetStudents: [""],
    topics: [""],
    pricing: { price: "", discountEnabled: false, discount: "" },
    isActive: true,
    lastUpdated: "",
    createdAt: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // New state for errors

  const formSteps = [
    "Basic Information",
    "Course Details",
    "Learn Points & Tech Stack",
    "Prerequisites & Requirements",
    "Curriculum",
    "Target Students",
    "Pricing",
    "Review & Publish",
  ];


  useEffect(() => {
    if (!id) return;
  
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const response = await getCourseById(id, token);
        if (response.success) {
          setFormData(response.data);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Error fetching course. Please try again later.");
        setError("Error fetching course. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchCourse();
  }, [id, token]);
  

  const updateFormData = (field, value) => {
    setFormData((prevState) => ({ ...prevState, [field]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await updateCourse(id, formData, token);
  
      if (response.success) {
        toast.success("Draft saved successfully!");
        setError(""); // Clear any previous errors
      } else {
        toast.error(response.message || "Failed to save changes. Please try again.");
        setError(response.message || "Failed to save changes. Please try again.");
      }
    } catch (error) {
      toast.error("An error occurred while saving. Please try again.");
      setError("An error occurred while saving. Please try again.");
    }
  };
  
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicInformationStep formData={formData} updateFormData={updateFormData} />;
      case 1:
        return <CourseDetailsStep formData={formData} updateFormData={updateFormData} />;
      case 2:
        return <LearnPointsStep formData={formData} updateFormData={updateFormData} />;
      case 3:
        return <PrerequisitesStep formData={formData} updateFormData={updateFormData} />;
      case 4:
        return <CurriculumStep formData={formData} updateFormData={updateFormData} />;
      case 5:
        return <TargetStudentsStep formData={formData} updateFormData={updateFormData} />;
      case 6:
        return <PricingStep formData={formData} updateFormData={updateFormData} />;
      case 7:
        return <ReviewStep formData={formData} updateFormData={updateFormData} />;
      default:
        return <div>Step not found</div>;
    }
  };
  
  if (loading) return (
      <div className="flex items-center justify-center min-h-screen bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
  );
  
  return (
      <div className="flex min-h-screen bg-base-200">
        <FormSidebar
            formSteps={formSteps}
            currentStep={currentStep}
            goToStep={setCurrentStep}
        />
        <main className="flex-1 p-6 transition-all duration-300">
          <div className="max-w-4xl mx-auto pt-16">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {renderStep()}
                
                <div className="card-actions mt-6 flex justify-between items-center border-t border-base-300 pt-4">
                  {currentStep > 0 && (
                      <button
                          className="btn btn-secondary btn-outline hover:scale-105 transition-transform duration-200"
                          onClick={() => setCurrentStep(currentStep - 1)}
                      >
                        Previous
                      </button>
                  )}
                  
                  <button
                      className="btn btn-ghost hover:bg-base-200 transition-colors duration-200"
                      onClick={handleSaveChanges}
                  >
                    Save Changes
                  </button>
                  
                  {currentStep < formSteps.length - 1 && (
                      <button
                          className="btn btn-primary hover:scale-105 transition-transform duration-200"
                          onClick={() => setCurrentStep(currentStep + 1)}
                      >
                        Next
                      </button>
                  )}
                </div>
                
                {error && (
                    <div className="alert alert-error mt-4 transition-all duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
  );
};
export default CourseForm;
