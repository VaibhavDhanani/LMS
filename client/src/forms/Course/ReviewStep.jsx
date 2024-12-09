const ReviewStep = ({ formData }) => {
  console.dir(formData)
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Review Your Course</h2>
      <div className="space-y-2">
        <h3 className="font-semibold">Basic Information</h3>
        <p>Title: {formData.title}</p>
        <p>Description: {formData.description}</p>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Instructor Pricing</h3>
        <p>Instructor: {formData.pricing.instructor}</p>
        <p>Price: ${formData.pricing.price}</p>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Course Details</h3>
        <p>Total Hours: {formData.details.totalHours}</p>
        <p>Lectures: {formData.details.lectures}</p>
        <p>Level: {formData.details.level}</p>
        <p>Last Updated: {formData.details.lastUpdated}</p>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Learn Points</h3>
        <ul>
          {formData.learnPoints.map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Prerequisites</h3>
        <ul>
          {formData.prerequisites.map((prerequisite, index) => (
            <li key={index}>{prerequisite}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Curriculum</h3>
        <ul>
          {formData.curriculum.map((lesson, index) => (
            <li key={index}>
              {lesson.title}: {lesson.description}
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold">Target Students</h3>
        <ul>
          {formData.targetStudents.map((student, index) => (
            <li key={index}>{student}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ReviewStep;
