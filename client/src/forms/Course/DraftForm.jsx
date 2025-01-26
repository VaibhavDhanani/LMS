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
import { getDraftById, updateDraft, publishDraft } from "../../services/draft.service.jsx";
import { useAuth } from "@/context/AuthContext";

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const {user ,token} =useAuth();
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    instructor: "",
    details: { totalMinutes: "", lectures: "", level: "" ,language:""},
    learnPoints: [""],
    technologies: [""],
    prerequisites: [""],
    requirements: [""],
    thumbnail: "",
    promotionalVideo: "",
    curriculum: [
      {
        section: "",
        lectures: [
          {
            title: "",
            description: "",
            video: "",
            duration: "",
            preview: false,
          },
        ],
      },
    ],
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
      console.log(token)
      getDraftById(id,token)
        .then((data) => {
          console.log(data)
          setFormData(data)
        })
        .catch((error) => setError("Error fetching draft. Please try again later."))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const updateFormData = (field, value) => {
    setFormData((prevState) => ({ ...prevState, [field]: value }));
  };

  const handleSaveChanges = () => {
    updateDraft(id, formData,token)
      .then(() => {
        console.log("Draft saved successfully!");
        setError(""); // Clear error if successful
      })
      .catch(() => setError("Failed to save changes. Please try again."));
  };

  const confirmPublish = () => {
    setShowConfirmModal(false);
    setLoading(true);
    updateDraft(id, formData,token)
      .then(() => publishDraft(id, formData,token))
      .then(() => {
        console.log("Draft published successfully!");
        setError(""); // Clear error if successful
        navigate("/mycourses");
      })
      .catch(() => setError("Failed to publish the course. Please try again."))
      .finally(() => setLoading(false));
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
          {currentStep === formSteps.length - 1 && (
            <button className="btn btn-success ml-auto" onClick={() => setShowConfirmModal(true)}>
              Publish Course
            </button>
          )}
        </div>

        {/* Error Message Display */}
        {error && <div className="mt-4 text-red-600">{error}</div>}

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4">Confirm Publish</h2>
              <p className="mb-6">
                Are you sure you want to publish this course? Once published, it will be visible to students.
              </p>
              <div className="flex justify-end">
                <button className="btn btn-outline mr-4" onClick={() => setShowConfirmModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-success" onClick={confirmPublish}>
                  Confirm & Publish
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CourseForm;
