import React, { useState } from "react";
import BasicInformationStep from "./BasicInformationStep";
import PricingStep from "./PricingStep";
import CourseDetailsStep from "./CourseDetailsStep";
import LearnPointsStep from "./LearnPointStep";
import PrerequisitesStep from "./PrerequisitesStep";
import CurriculumStep from "./CurriculumStep";
import TargetStudentsStep from "./TargetStudentsStep";
import ReviewStep from "./ReviewStep";
import FormSidebar from "./FormSidebar";

const formSteps = [
  "Basic Information",
  "Course Details",
  "Learn Points & Stack",
  "Prerequisites & Requirements",
  "Curriculum",
  "Target Students",
  "Pricing",
  "Review & Publish",
];

const CourseForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    instructor: "",
    details: { totalHours: "", lectures: "", level: ""},
    learnPoints: [""],
    technologies: {
      available: [""],  // Array of selected predefined tech names
      new: [{
        name: "",
        logo: "",
      }],
    },
    prerequisites: [""],
    requirements: [""],
    thumbnail: "",
    promotionalVideo:"",
    curriculum: [
      {
        lectures: [{ title: "", description:"", video:"", duration: "", preview: false }],
      },
    ],
    targetStudents: [""],
    topics:[""],
    pricing: {
        price: "",
        discountEnabled: false,
        discount: "",
      },
    isActive: true,
    lastUpdated:"",
    createdAt:"",
  });

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < formSteps.length - 1) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const goToStep = (step) => setCurrentStep(step);

  const handleSubmit = () => {
    console.log("Final Form Submission:", formData);
    // Add submission logic here
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInformationStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 1:
        return (
          <CourseDetailsStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <LearnPointsStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <PrerequisitesStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 4:
        return (
          <CurriculumStep formData={formData} updateFormData={updateFormData} />
        );
      case 5:
        return (
          <TargetStudentsStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 6:
          return (
            <PricingStep
              formData={formData}
              updateFormData={updateFormData}
            />
          );
      case 7:
        return <ReviewStep formData={formData} />;
      default:
        return <div>Step not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-base-200">
      <FormSidebar
        formSteps={formSteps}
        currentStep={currentStep}
        goToStep={goToStep}
      />
      <main className="w-3/4 p-6 bg-white shadow-lg">
        {renderStep()}
        <div className="mt-6 flex justify-between">
          {currentStep > 0 && (
            <button className="btn btn-secondary" onClick={handlePrevious}>
              Previous
            </button>
          )}
          {currentStep < formSteps.length - 1 && (
            <button className="btn btn-primary ml-auto" onClick={handleNext}>
              Next
            </button>
          )}
          {currentStep === formSteps.length - 1 && (
            <button className="btn btn-success" onClick={handleSubmit}>
              Submit Course
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default CourseForm;
