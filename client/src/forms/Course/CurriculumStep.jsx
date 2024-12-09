const CurriculumStep = ({ formData, updateFormData }) => {
    const addLesson = () => {
      updateFormData("curriculum", [
        ...formData.curriculum,
        { title: "", description: "" },
      ]);
    };
  
    const updateLesson = (index, key, value) => {
      const updatedCurriculum = [...formData.curriculum];
      updatedCurriculum[index][key] = value;
      updateFormData("curriculum", updatedCurriculum);
    };
  
    const removeLesson = (index) => {
      const updatedCurriculum = formData.curriculum.filter((_, i) => i !== index);
      updateFormData("curriculum", updatedCurriculum);
    };
  
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Curriculum</h2>
        {formData.curriculum.map((lesson, index) => (
          <div key={index} className="space-y-2">
            <input
              type="text"
              className="input input-bordered"
              placeholder="Lesson Title"
              value={lesson.title}
              onChange={(e) => updateLesson(index, "title", e.target.value)}
            />
            <textarea
              className="textarea textarea-bordered"
              placeholder="Lesson Description"
              value={lesson.description}
              onChange={(e) => updateLesson(index, "description", e.target.value)}
            ></textarea>
            <button
              className="btn btn-error btn-sm"
              onClick={() => removeLesson(index)}
            >
              Remove Lesson
            </button>
          </div>
        ))}
        <button className="btn btn-primary" onClick={addLesson}>
          Add Lesson
        </button>
      </div>
    );
  };
  
  export default CurriculumStep;