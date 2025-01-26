import { useState, useEffect } from "react";
import Select from "react-select";

// Importing React Icons
import {FaReact, FaNodeJs, FaJs, FaPython, FaDocker} from "react-icons/fa";
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
  SiPytorch, SiScikitlearn, SiAmazon
} from "react-icons/si";

const LearnPointsStep = ({ formData, updateFormData }) => {
  // Hardcoded technology list with React Icons
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

  console.log(formData)


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
