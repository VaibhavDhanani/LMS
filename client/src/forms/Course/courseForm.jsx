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
    if (id) {
      setLoading(true);
      getCourseById(id,token)
        .then((data) => {
          console.log(data);
          setFormData(data)
        })
        .catch((error) => setError("Error fetching draft. Please try again later."))
        .finally(() => setLoading(false));
    }

  },[id]);

  const updateFormData = (field, value) => {
    setFormData((prevState) => ({ ...prevState, [field]: value }));
  };

  const handleSaveChanges = () => {
    updateCourse(id, formData,token)
      .then(() => {
        console.log("Draft saved successfully!");
        setError(""); // Clear error if successful
      })
      .catch(() => setError("Failed to save changes. Please try again."));
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

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex min-h-screen bg-base-200">
      <FormSidebar formSteps={formSteps} currentStep={currentStep} goToStep={setCurrentStep} />
      <main className="w-3/4 p-6 bg-white shadow-lg">
        {renderStep()}
        <div className="mt-6 flex justify-between">
          {currentStep > 0 && (
            <button className="btn btn-secondary" onClick={() => setCurrentStep(currentStep - 1)}>
              Previous
            </button>
          )}
          <button className="btn btn-outline ml-4" onClick={handleSaveChanges}>
            Save Changes
          </button>
          {currentStep < formSteps.length - 1 && (
            <button className="btn btn-primary ml-auto" onClick={() => setCurrentStep(currentStep + 1)}>
              Next
            </button>
          )}
        </div>

        {/* Error Message Display */}
        {error && <div className="mt-4 text-red-600">{error}</div>}

      </main>
    </div>
  );
};

export default CourseForm;
