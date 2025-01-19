import React, { useMemo } from 'react';

const ReviewStep = ({ formData }) => {
  // Memoize the final price calculation
  const finalPrice = useMemo(() => {
    if (formData.pricing?.discountEnabled && formData.pricing?.price) {
      const discountAmount = (formData.pricing.discount / 100) * formData.pricing.price;
      return formData.pricing.price - discountAmount;
    }
    return formData.pricing?.price || 0;
  }, [formData.pricing?.discount, formData.pricing?.discountEnabled, formData.pricing?.price]);

  // Memoize the number of lectures
  const totalLectures = useMemo(() => formData.lectures?.length || 0, [formData.lectures]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Review Your Course</h2>

      {/* Basic Information Section */}
      <div className="space-y-2">
        <h3 className="font-semibold">Basic Information</h3>
        <p>Title: {formData.title || "N/A"}</p>
        <p>Subtitle: {formData.subtitle || "N/A"}</p>
        <p>Description: {formData.description || "N/A"}</p>
      </div>

      {/* Instructor Pricing Section */}
      <div className="space-y-2">
        <h3 className="font-semibold">Instructor</h3>
        <p>Instructor: {formData.instructor?.username || "N/A"}</p>
      </div>
      
      {/* Pricing */}
      <div className="space-y-2">
        <h3 className="font-semibold">Pricing</h3>
        <p>Original Price: ${formData.pricing?.price || "N/A"}</p>
        <p>Discounted: {formData.pricing?.discountEnabled === 'true' ? "Yes" : "No"}</p>
        <p>Final Price: ${finalPrice.toFixed(2)}</p>
      </div>

      {/* Course Details Section */}
      <div className="space-y-2">
        <h3 className="font-semibold">Course Details</h3>
        <p>Total Hours: {formData.details?.totalHours || "N/A"}</p>
        <p>Lectures: {totalLectures}</p>
        <p>Level: {formData.details?.level || "N/A"}</p>
        <p>Last Updated: {formData.lastUpdated || "N/A"}</p>
      </div>

      {/* Learn Points Section */}
      <div className="space-y-2">
        <h3 className="font-semibold">Learn Points</h3>
        <ul>
          {formData.learnPoints?.length > 0 ? (
            formData.learnPoints.map((point, index) => (
              <li key={index}>{point}</li>
            ))
          ) : (
            <li>No learn points available.</li>
          )}
        </ul>

        <h4 className="font-semibold">Tech Stack</h4>
        <ul>
          {formData.technologies?.length > 0 ? (
            formData.technologies.map((tech, index) => (
              <li key={index}>{tech}</li>
            ))
          ) : (
            <li>No tech stack listed.</li>
          )}
        </ul>
      </div>

      {/* Prerequisites Section */}
      <div className="space-y-2">
        <h3 className="font-semibold">Prerequisites</h3>
        <ul>
          {formData.prerequisites?.length > 0 ? (
            formData.prerequisites.map((prerequisite, index) => (
              <li key={index}>{prerequisite}</li>
            ))
          ) : (
            <li>No prerequisites listed.</li>
          )}
        </ul>
      </div>

      {/* Curriculum Section */}
      <div className="space-y-2">
        <h3 className="font-semibold">Curriculum</h3>
        <ul>
          {formData.lectures?.length > 0 ? (
            formData.lectures.map((lesson, index) => (
              <li key={index}>
                <strong>{index + 1} {lesson.title}:</strong> {lesson.description} <br />
              </li>
            ))
          ) : (
            <li>No curriculum available.</li>
          )}
        </ul>
      </div>

      {/* Target Students Section */}
      <div className="space-y-2">
        <h3 className="font-semibold">Target Students</h3>
        <ul>
          {formData.targetStudents?.length > 0 ? (
            formData.targetStudents.map((student, index) => (
              <li key={index}>{student}</li>
            ))
          ) : (
            <li>No target students listed.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ReviewStep;
