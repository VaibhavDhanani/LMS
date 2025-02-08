import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Trash } from "lucide-react";

// Reusable EditableList Component
const EditableList = ({ items, onAdd, onUpdate, onRemove, placeholder }) => {
  return (
      <div className="space-y-3">
        {items.map((item, index) => (
            <div key={index} className="flex gap-3 items-center">
              <input
                  type="text"
                  className="input input-bordered input-primary flex-1"
                  placeholder={`${placeholder} ${index + 1}`}
                  value={item}
                  onChange={(e) => onUpdate(index, e.target.value)}
                  aria-label={`${placeholder} ${index + 1}`}
              />
              <button
                  className="btn btn-outline btn-error btn-sm flex items-center gap-1"
                  onClick={() => onRemove(index)}
                  aria-label={`Remove ${placeholder.toLowerCase()} ${index + 1}`}
              >
                <Trash className="h-4 w-4" />
                Remove
              </button>
            </div>
        ))}
        <button
            className="btn btn-outline btn-primary flex items-center gap-2 mt-2"
            onClick={onAdd}
            aria-label={`Add ${placeholder.toLowerCase()}`}
        >
          <Plus className="h-5 w-5" />
          Add {placeholder}
        </button>
      </div>
  );
};

// Main Component
const TargetStudentsStep = ({ formData, updateFormData }) => {
  // Add, Update, Remove functions for Target Students
  const addTargetStudent = () => {
    if (formData.targetStudents.some((student) => student.trim() === "")) {
      alert("Please fill in all target students before adding more.");
      return;
    }
    updateFormData("targetStudents", [...formData.targetStudents, ""]);
  };
  
  const updateTargetStudent = (index, value) => {
    const updatedStudents = [...formData.targetStudents];
    updatedStudents[index] = value;
    updateFormData("targetStudents", updatedStudents);
  };
  
  const removeTargetStudent = (index) => {
    if (window.confirm("Are you sure you want to remove this entry?")) {
      const updatedStudents = formData.targetStudents.filter((_, i) => i !== index);
      updateFormData("targetStudents", updatedStudents);
    }
  };
  
  // Add, Update, Remove functions for Topics
  const addTopic = () => {
    if (formData.topics.some((topic) => topic.trim() === "")) {
      alert("Please fill in all topics before adding more.");
      return;
    }
    updateFormData("topics", [...formData.topics, ""]);
  };
  
  const updateTopic = (index, value) => {
    const updatedTopics = [...formData.topics];
    updatedTopics[index] = value;
    updateFormData("topics", updatedTopics);
  };
  
  const removeTopic = (index) => {
    if (window.confirm("Are you sure you want to remove this entry?")) {
      const updatedTopics = formData.topics.filter((_, i) => i !== index);
      updateFormData("topics", updatedTopics);
    }
  };
  
  return (
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Target Students Section */}
        <Card className="shadow-lg">
          <CardHeader className="bg-primary text-white rounded-t-lg px-6 py-4">
            <CardTitle className="text-lg font-semibold">🎯 Who is this course for?</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <EditableList
                items={formData.targetStudents}
                onAdd={addTargetStudent}
                onUpdate={updateTargetStudent}
                onRemove={removeTargetStudent}
                placeholder="Target Student"
            />
          </CardContent>
        </Card>
        
        {/* Topics Section */}
        <Card className="shadow-lg">
          <CardHeader className="bg-primary text-white rounded-t-lg px-6 py-4">
            <CardTitle className="text-lg font-semibold">📚 Course Topics</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <EditableList
                items={formData.topics}
                onAdd={addTopic}
                onUpdate={updateTopic}
                onRemove={removeTopic}
                placeholder="Topic"
            />
          </CardContent>
        </Card>
      </div>
  );
};

export default TargetStudentsStep;
