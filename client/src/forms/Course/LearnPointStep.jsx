import { useState, useEffect } from 'react';
import Select from 'react-select';

const LearnPointsStep = ({ formData, updateFormData }) => {
  const [newTech, setNewTech] = useState({ name: '', logo: null });
  
  // available technologies list with logos
  const availableTechnologies = [
    { name: 'React', logo: '/tech-logos/react.svg' },
    { name: 'Node.js', logo: '/tech-logos/nodejs.svg' },
    { name: 'JavaScript', logo: '/tech-logos/javascript.svg' },
    { name: 'Python', logo: '/tech-logos/python.svg' },
    { name: 'MongoDB', logo: '/tech-logos/mongodb.svg' },
    { name: 'Express.js', logo: '/tech-logos/expressjs.svg' },
    { name: 'TypeScript', logo: '/tech-logos/typescript.svg' },
    { name: 'Next.js', logo: '/tech-logos/nextjs.svg' },
  ];

  const options = availableTechnologies.map(tech => ({
    value: tech.name,
    label: (
      <div className="flex items-center">
        <img src={tech.logo} alt={tech.name} className="w-6 h-6 mr-2" />
        {tech.name}
      </div>
    ),
    logo: tech.logo,
  }));

  // Initialize form data
  useEffect(() => {
    if (!formData.learnPoints) {
      updateFormData('learnPoints', []);
    }
    if (!formData.technologies) {
      updateFormData('technologies', { available: [], new: [] });
    }
  }, []);

  // Learn Points handlers
  const addLearnPoint = () => {
    if (formData.learnPoints.some((point) => point === "")) {
      alert("Please complete existing learn points before adding a new one.");
      return;
    }
    updateFormData('learnPoints', [...formData.learnPoints, '']);
  };
  

  const updateLearnPoint = (index, value) => {
    const updatedPoints = [...formData.learnPoints];
    updatedPoints[index] = value;
    updateFormData('learnPoints', updatedPoints);
  };

  const removeLearnPoint = (index) => {
    const updatedPoints = formData.learnPoints.filter((_, i) => i !== index);
    updateFormData('learnPoints', updatedPoints);
  };

  // Technology handlers
  const handleAvailableTechChange = (selectedOptions) => {
    const selectedTechs = selectedOptions.map(option => option.value);
    updateFormData('technologies', {
      ...formData.technologies,
      available: selectedTechs
    });
  };

  const handleNewTechLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewTech(prev => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addNewTech = () => {
    if (newTech.name && newTech.logo) {
      updateFormData('technologies', {
        ...formData.technologies,
        new: [...formData.technologies.new, { ...newTech }]
      });
      setNewTech({ name: '', logo: null });
    }
  };

  const removeNewTech = (index) => {
    const updatedNewTech = formData.technologies.new.filter((_, i) => i !== index);
    updateFormData('technologies', {
      ...formData.technologies,
      new: updatedNewTech
    });
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

        {/* Available Technologies Selection with Search */}
        <div className="form-control">
          <label className="label">Select Technologies</label>
          <Select
            isMulti
            name="technologies"
            options={options}
            className="w-full"
            value={options.filter(option => formData.technologies?.available.includes(option.value))}
            onChange={handleAvailableTechChange}
            closeMenuOnSelect={false}
          />
        </div>

        {/* Display Selected Predefined Technologies */}
        {formData.technologies?.available?.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formData.technologies.available.map((techName) => {
              const tech = availableTechnologies.find(t => t.name === techName);
              return (
                <div key={techName} className="flex items-center gap-2 p-2 border rounded-lg">
                  {tech?.logo && <img src={tech.logo} alt={tech.name} className="w-8 h-8" />}
                  <span>{tech?.name}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* New Technology Input */}
        <div className="space-y-4">
          <h4 className="text-md font-medium">Add new Technology</h4>
          <input
            type="text"
            className="input input-bordered w-full"
            placeholder="Technology Name"
            value={newTech.name}
            onChange={(e) => setNewTech(prev => ({ ...prev, name: e.target.value }))}
          />
          <input
            type="file"
            accept="image/*"
            className="file-input file-input-bordered w-full"
            onChange={handleNewTechLogoChange}
          />
          {newTech.logo && (
            <img src={newTech.logo} alt="Preview" className="w-16 h-16 object-contain" />
          )}
          <button
            className="btn btn-primary w-full"
            onClick={addNewTech}
            disabled={!newTech.name || !newTech.logo}
          >
            Add New Technology
          </button>
        </div>

        {/* Display new Technologies */}
        {formData.technologies?.new?.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-medium">New Technologies</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.technologies.new.map((tech, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <img src={tech.logo} alt={tech.name} className="w-8 h-8 object-contain" />
                    <span>{tech.name}</span>
                  </div>
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => removeNewTech(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearnPointsStep;
