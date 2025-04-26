import { useState, useEffect } from "react";
import Select from "react-select";
import { FaReact, FaNodeJs, FaJs, FaPython, FaDocker } from "react-icons/fa";
import {
  SiMongodb,
  SiExpress,
  SiTypescript,
  SiNextdotjs,
  SiVuedotjs,
  SiAngular,
  SiSvelte,
  SiNuxtdotjs,
  SiDjango,
  SiFlask,
  SiSpringboot,
  SiPydantic,
  SiRuby,
  SiPostgresql,
  SiMysql,
  SiRedis,
  SiApachecassandra,
  SiFirebase,
  SiKubernetes,
  SiTerraform,
  SiJenkins,
  SiGithubactions,
  SiFlutter,
  SiKotlin,
  SiSwift,
  SiTensorflow,
  SiPytorch,
  SiScikitlearn,
  SiAmazon,
} from "react-icons/si";

const LearnPointsStep = ({ formData, updateFormData }) => {
  const [animatePoint, setAnimatePoint] = useState(null);

  const availableTechnologies = [
    // Frontend Technologies
    { name: "React", icon: <FaReact /> },
    { name: "Vue.js", icon: <SiVuedotjs /> },
    { name: "Angular", icon: <SiAngular /> },
    { name: "Svelte", icon: <SiSvelte /> },
    { name: "Next.js", icon: <SiNextdotjs /> },
    { name: "Nuxt.js", icon: <SiNuxtdotjs /> },
    { name: "TypeScript", icon: <SiTypescript /> },
    { name: "JavaScript", icon: <FaJs /> },

    // Backend Technologies
    { name: "Node.js", icon: <FaNodeJs /> },
    { name: "Express.js", icon: <SiExpress /> },
    { name: "Django", icon: <SiDjango /> },
    { name: "Flask", icon: <SiFlask /> },
    { name: "Spring Boot", icon: <SiSpringboot /> },
    { name: "FastAPI", icon: <SiPydantic /> },
    { name: "Ruby on Rails", icon: <SiRuby /> },

    // Databases
    { name: "MongoDB", icon: <SiMongodb /> },
    { name: "PostgreSQL", icon: <SiPostgresql /> },
    { name: "MySQL", icon: <SiMysql /> },
    { name: "Redis", icon: <SiRedis /> },
    { name: "Cassandra", icon: <SiApachecassandra /> },
    { name: "Firebase", icon: <SiFirebase /> },

    // Cloud and DevOps
    { name: "AWS", icon: <SiAmazon /> },
    { name: "Docker", icon: <FaDocker /> },
    { name: "Kubernetes", icon: <SiKubernetes /> },
    { name: "Terraform", icon: <SiTerraform /> },
    { name: "Jenkins", icon: <SiJenkins /> },
    { name: "GitHub Actions", icon: <SiGithubactions /> },

    // Mobile Development
    { name: "React Native", icon: <FaReact /> },
    { name: "Flutter", icon: <SiFlutter /> },
    { name: "Kotlin", icon: <SiKotlin /> },
    { name: "Swift", icon: <SiSwift /> },

    // Machine Learning and AI
    { name: "Python", icon: <FaPython /> },
    { name: "TensorFlow", icon: <SiTensorflow /> },
    { name: "PyTorch", icon: <SiPytorch /> },
    { name: "Scikit-learn", icon: <SiScikitlearn /> },
  ];

  const customSelectStyles = {
    control: (styles) => ({
      ...styles,
      backgroundColor: "hsl(var(--b1))",
      borderColor: "hsl(var(--bc) / 0.2)",
      "&:hover": {
        borderColor: "hsl(var(--p))",
      },
    }),
    option: (styles, { isFocused, isSelected }) => ({
      ...styles,
      backgroundColor: isSelected
        ? "#4a90e2"
        : isFocused
        ? "#f0f0f0"
        : "#ffffff",
      color: isSelected ? "#ffffff" : "#333333",
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: "hsl(var(--b1))",
      border: "1px solid hsl(var(--bc) / 0.2)",
    }),
    multiValue: (styles) => ({
      ...styles,
      backgroundColor: "hsl(var(--p) / 0.1)",
    }),
    multiValueLabel: (styles) => ({
      ...styles,
      color: "hsl(var(--bc))",
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      ":hover": {
        backgroundColor: "hsl(var(--er))",
        color: "hsl(var(--erc))",
      },
    }),
  };

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

  useEffect(() => {
    updateFormData("learnPoints", formData.learnPoints || []);
    updateFormData("technologies", formData.technologies || []);
  }, []);

  const addLearnPoint = () => {
    if (formData.learnPoints.includes("")) return;
    const updatedPoints = [...formData.learnPoints, ""];
    updateFormData("learnPoints", updatedPoints);
    setAnimatePoint(formData.learnPoints.length);
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

  const handleTechChange = (selectedOptions) => {
    const selectedTechs = selectedOptions.map((option) => option.value);
    updateFormData("technologies", selectedTechs);
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-base-300 pb-4">
        <h2 className="text-2xl font-bold text-base-content">
          What Will Students Learn?
        </h2>
        <p className="mt-2 text-base-content/70">
          List the key learning outcomes for your course
        </p>
      </div>

      {/* Learn Points Section */}
      <div className="space-y-4">
        <div className="bg-base-200 p-4 rounded-lg space-y-1">
          <h3 className="font-medium text-base-content">Learning Objectives</h3>
          <p className="text-sm text-base-content/70">
            Add clear, specific learning outcomes
          </p>
        </div>

        <div className="space-y-3">
          {formData.learnPoints?.map((point, index) => (
            <div
              key={index}
              className={`flex gap-3 items-center transform transition-all duration-300
                ${animatePoint === index ? "animate-fadeIn" : ""}`}
            >
              <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary font-medium">
                {index + 1}
              </div>
              <input
                type="text"
                className="input input-bordered flex-1 bg-base-100 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
                placeholder="e.g., Build a full-stack web application from scratch"
                value={point}
                onChange={(e) => updateLearnPoint(index, e.target.value)}
              />
              <button
                className="btn btn-ghost btn-circle text-base-content/70 hover:text-error hover:bg-error/10 transition-colors duration-200"
                onClick={() => removeLearnPoint(index)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}

          <button
            className="btn btn-outline btn-primary gap-2 hover:scale-105 transition-transform duration-200"
            onClick={addLearnPoint}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add Learning Objective
          </button>
        </div>
      </div>

      <div className="space-y-6 pt-4 border-t border-base-300">
        <div className="bg-base-200 p-4 rounded-lg space-y-1">
          <h3 className="font-medium text-base-content">
            Technologies Covered
          </h3>
          <p className="text-sm text-base-content/70">
            Select the technologies students will learn
          </p>
        </div>

        <Select
          isMulti
          name="technologies"
          options={options}
          className="w-full"
          styles={customSelectStyles}
          value={options.filter(
            (option) =>
              Array.isArray(formData.technologies) &&
              formData.technologies.includes(option.value)
          )}
          onChange={handleTechChange}
          closeMenuOnSelect={false}
        />

        {formData.technologies.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {formData.technologies.map((techName) => {
              const tech = availableTechnologies.find(
                (t) => t.name === techName
              );
              return (
                <div
                  key={techName}
                  className="flex items-center gap-3 p-3 bg-base-200 rounded-lg hover:bg-base-300 transition-colors duration-200"
                >
                  {tech?.icon && (
                    <div className="text-2xl text-primary">{tech.icon}</div>
                  )}
                  <span className="text-sm font-medium text-base-content">
                    {tech?.name}
                  </span>
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
