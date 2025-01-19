import { useState, useEffect } from "react";
import Select from "react-select";

// Importing React Icons
import { FaReact, FaNodeJs, FaJs, FaPython } from "react-icons/fa";
import { SiMongodb, SiExpress, SiTypescript, SiNextdotjs } from "react-icons/si";

const LearnPointsStep = ({ formData, updateFormData }) => {
  // Hardcoded technology list with React Icons
  const availableTechnologies = [
    { name: "React", icon: <FaReact /> },
    { name: "Node.js", icon: <FaNodeJs /> },
    { name: "JavaScript", icon: <FaJs /> },
    { name: "Python", icon: <FaPython /> },
    { name: "MongoDB", icon: <SiMongodb /> },
    { name: "Express.js", icon: <SiExpress /> },
    { name: "TypeScript", icon: <SiTypescript /> },
    { name: "Next.js", icon: <SiNextdotjs /> },
  ];

  // Options for the React Select component
  const options = availableTechnologies.map((tech) => ({
    value: tech.name,
    label: (
      <div className="flex items-center gap-2">
        <div className="text-xl">{tech.icon}</div>
        {tech.name}
      </div>
    ),
    icon: tech.icon,
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
            Array.isArray(formData.technologies) &&
            formData.technologies.includes(option.value)
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
                  {tech?.icon && <div className="text-2xl">{tech.icon}</div>}
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
