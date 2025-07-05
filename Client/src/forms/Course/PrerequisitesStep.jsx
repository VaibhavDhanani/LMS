import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

const PrerequisitesStep = ({ formData, updateFormData }) => {
  // Functions for Prerequisites
  const addPrerequisite = useCallback(() => {
    if (!formData.prerequisites.includes("") && !formData.prerequisites.some(item => item === "")) {
      updateFormData("prerequisites", [...formData.prerequisites, ""]);
    }
  }, [formData, updateFormData]);
  
  const updatePrerequisite = useCallback((index, value) => {
    const updatedPrereqs = [...formData.prerequisites];
    updatedPrereqs[index] = value;
    updateFormData("prerequisites", updatedPrereqs);
  }, [formData, updateFormData]);
  
  const removePrerequisite = useCallback((index) => {
    const updatedPrereqs = formData.prerequisites.filter((_, i) => i !== index);
    updateFormData("prerequisites", updatedPrereqs);
  }, [formData, updateFormData]);
  
  // Functions for Requirements
  const addRequirement = useCallback(() => {
    if (!formData.requirements.includes("") && !formData.requirements.some(item => item === "")) {
      updateFormData("requirements", [...formData.requirements, ""]);
    }
  }, [formData, updateFormData]);
  
  const updateRequirement = useCallback((index, value) => {
    const updatedReqs = [...formData.requirements];
    updatedReqs[index] = value;
    updateFormData("requirements", updatedReqs);
  }, [formData, updateFormData]);
  
  const removeRequirement = useCallback((index) => {
    const updatedReqs = formData.requirements.filter((_, i) => i !== index);
    updateFormData("requirements", updatedReqs);
  }, [formData, updateFormData]);
  
  return (
      <div className="space-y-8">
        {/* Prerequisites Section */}
        <Card className="border border-gray-200 bg-white shadow-md rounded-lg">
          <CardHeader className="bg-primary text-white rounded-t-lg px-6 py-4">
            <CardTitle className="text-xl font-semibold">📌 Prerequisites</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {formData.prerequisites.map((prerequisite, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                      value={prerequisite}
                      onChange={(e) => updatePrerequisite(index, e.target.value)}
                      placeholder="Enter prerequisite..."
                      className="flex-1 input input-bordered input-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePrerequisite(index)}
                      className="text-gray-500 hover:text-red-500 transition duration-300"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                onClick={addPrerequisite}
                className="w-full btn btn-outline btn-primary flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Prerequisite
            </Button>
          </CardContent>
        </Card>
        
        {/* Requirements Section */}
        <Card className="border border-gray-200 bg-white shadow-md rounded-lg">
          <CardHeader className="bg-primary text-white rounded-t-lg px-6 py-4">
            <CardTitle className="text-xl font-semibold">🛠️ Requirements</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Input
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder="Enter requirement..."
                      className="flex-1 input input-bordered input-secondary focus:ring focus:ring-secondary focus:ring-opacity-50"
                  />
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRequirement(index)}
                      className="text-gray-500 hover:text-red-500 transition duration-300"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                onClick={addRequirement}
                className="w-full btn btn-outline btn-secondary flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Add Requirement
            </Button>
          </CardContent>
        </Card>
      </div>
  );
};

export default PrerequisitesStep;
