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
import { toast } from "react-toastify";

const CourseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    instructor: "",
    details: { totalMinutes: "", lectures: "", level: "", language: "" },
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
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  
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
      getDraftById(id, token)
        .then((response) => {
          if (response.success) {
            setFormData(response.data);
            setSaveStatus("All changes saved");
          } else {
            toast.error(response.message);
            setError(response.message);
          }
        })
        .catch(() => {
          toast.error("Error fetching draft. Please try again later.");
          setError("Error fetching draft. Please try again later.");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);
  
  const updateFormData = (field, value) => {
    setFormData((prevState) => ({ ...prevState, [field]: value }));
    setSaveStatus("Unsaved changes");
  };
  
  const handleSaveChanges = async () => {
    setSaveStatus("Saving...");
    try {
      const response = await updateDraft(id, formData, token);
      if (response.success) {
        toast.success("Draft saved successfully!");
        setSaveStatus("All changes saved");
        setError("");
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      toast.error("Failed to save changes. Please try again.");
      setError("Failed to save changes. Please try again.");
      setSaveStatus("Save failed");
    }
  };
  
  const confirmPublish = async () => {
    setShowConfirmModal(false);
    setLoading(true);
    try {
      const saveResponse = await updateDraft(id, formData, token);
      if (!saveResponse.success) throw new Error(saveResponse.message);
  
      const publishResponse = await publishDraft(id, formData, token);
      
      if (publishResponse.success) {
        toast.success("Course published successfully!");
        navigate("/mycourses");
      } else {
        toast.error(publishResponse.message||"Failed to publish the course. Please try again.");
        setError(publishResponse.message||"Failed to publish the course. Please try again.");
      }
    } catch (err) {
      toast.error("Failed to publish the course. Please try again.");
      setError("Failed to publish the course. Please try again.");
    } finally {
      setLoading(false);
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
  
  if (loading) {
    return (
        <div className="min-h-screen bg-base-200 flex items-center justify-center">
          <div className="text-center space-y-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-base-content/70">Loading your course...</p>
          </div>
        </div>
    );
  }
  
  return (
      <div className="flex min-h-screen bg-base-200">
        <FormSidebar formSteps={formSteps} currentStep={currentStep} goToStep={setCurrentStep} />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto pt-16">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                {/* Progress Indicator */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-base-content/70">
                      Step {currentStep + 1} of {formSteps.length}
                    </p>
                    {/* <span className="text-sm text-base-content/70">{saveStatus}</span> */}
                  </div>
                  <progress
                      className="progress progress-primary w-full"
                      value={(currentStep + 1) * (100 / formSteps.length)}
                      max="100"
                  ></progress>
                </div>
                
                {renderStep()}
                
                <div className="card-actions mt-8 flex items-center justify-between border-t border-base-300 pt-6">
                  <div className="flex gap-2">
                    {currentStep > 0 && (
                        <button
                            className="btn btn-outline btn-secondary hover:scale-105 transition-transform duration-200"
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
                  </div>
                  
                  <div>
                    {currentStep < formSteps.length - 1 ? (
                        <button
                            className="btn btn-primary hover:scale-105 transition-transform duration-200"
                            onClick={() => setCurrentStep(currentStep + 1)}
                        >
                          Next
                        </button>
                    ) : (
                        <button
                            className="btn btn-success hover:scale-105 transition-transform duration-200"
                            onClick={() => setShowConfirmModal(true)}
                        >
                          Publish Course
                        </button>
                    )}
                  </div>
                </div>
                
                {error && (
                    <div className="alert alert-error mt-4 animate-fadeIn">
                      <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Confirmation Modal */}
          {showConfirmModal && (
              <div className="fixed inset-0 bg-base-300/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300">
                <div className="modal-box bg-base-100 relative">
                  <h3 className="font-bold text-lg text-base-content">Confirm Publication</h3>
                  <p className="py-4 text-base-content/80">
                    Are you sure you want to publish this course? Once published, it will be visible to students.
                  </p>
                  <div className="modal-action">
                    <button
                        className="btn btn-outline"
                        onClick={() => setShowConfirmModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                        className="btn btn-success hover:scale-105 transition-transform duration-200"
                        onClick={confirmPublish}
                    >
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