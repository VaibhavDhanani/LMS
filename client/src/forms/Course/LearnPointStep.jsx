import { useState, useEffect } from "react";
import Select from "react-select";

const LearnPointsStep = ({ formData, updateFormData }) => {
  const availableTechnologies = [
    { name: "React", logo: "/tech-logos/react.svg" },
    { name: "Node.js", logo: "/tech-logos/nodejs.svg" },
    { name: "JavaScript", logo: "/tech-logos/javascript.svg" },
    { name: "Python", logo: "/tech-logos/python.svg" },
    { name: "MongoDB", logo: "/tech-logos/mongodb.svg" },
    { name: "Express.js", logo: "/tech-logos/expressjs.svg" },
    { name: "TypeScript", logo: "/tech-logos/typescript.svg" },
    { name: "Next.js", logo: "/tech-logos/nextjs.svg" },
  ];

  const options = availableTechnologies.map((tech) => ({
    value: tech.name,
    label: (
      <div className="flex items-center">
        <img src={tech.logo} alt={tech.name} className="w-6 h-6 mr-2" />
        {tech.name}
      </div>
    ),
    logo: tech.logo,
  }));

  // Initialize default form values
  useEffect(() => {
    updateFormData("learnPoints", formData.learnPoints || []);
    updateFormData("technologies", formData.technologies || []);
  }, []);

  // Learn Points Handlers
  const addLearnPoint = () => {
    if (formData.learnPoints.includes("")) {
      return; // Prevent adding new input until current is filled
    }
    updateFormData("learnPoints", [...formData.learnPoints, ""]);
  };

  const updateLearnPoint = (index, value) => {
    const updatedPoints = [...formData.learnPoints];
    updatedPoints[index] = value;
    updateFormData("learnPoints", updatedPoints);
  };

  const removeLearnPoint = (index) => {
    const updatedPoints = formData.learnPoints.filter((_, i) => i !== index);
    updateFormData("learnPoints", updatedPoints);
  };

  // Technologies Handler
  const handleTechChange = (selectedOptions) => {
    const selectedTechs = selectedOptions.map((option) => option.value);
    updateFormData("technologies", selectedTechs);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">What Will Students Learn?</h2>

      {/* Learn Points Section */}
      <div className="space-y-4">
        {formData.learnPoints?.map((point, index) => (
          <div key={index} className="flex gap-2 items-center">
            <input
              type="text"
              className="input input-bordered flex-1"
              placeholder={`Learn point ${index + 1}`}
              value={point}
              onChange={(e) => updateLearnPoint(index, e.target.value)}
            />
            <button
              className="btn btn-error btn-sm"
              onClick={() => removeLearnPoint(index)}
            >
              Remove
            </button>
          </div>
        ))}
        <button className="btn btn-primary" onClick={addLearnPoint}>
          Add Learn Point
        </button>
      </div>

      {/* Technologies Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium">Technologies Taught</h3>
        <Select
          isMulti
          name="technologies"
          options={options}
          className="w-full"
          value={options.filter((option) =>
            Array.isArray(formData.technologies) && formData.technologies.includes(option.value)
          )}
          
          onChange={handleTechChange}
          closeMenuOnSelect={false}
        />

        {/* Display Selected Technologies */}
        {formData.technologies.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.technologies.map((techName) => {
              const tech = availableTechnologies.find(
                (t) => t.name === techName
              );
              return (
                <div
                  key={techName}
                  className="flex items-center gap-2 p-2 border rounded-lg"
                >
                  {tech?.logo && (
                    <img src={tech.logo} alt={tech.name} className="w-8 h-8" />
                  )}
                  <span>{tech?.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnPointsStep;
