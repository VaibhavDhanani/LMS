import React from "react";

export const PrerequisitesSection = ({ course }) => {
  return (
    <div className="mt-12 grid md:grid-cols-3 gap-8">
      {/* Prerequisites Section */}
      {course.prerequisites && course.prerequisites.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Prerequisites</h2>
          <ul className="list-disc pl-5 space-y-2">
            {course.prerequisites.map((prereq, index) => (
              <li key={index}>{prereq}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Requirements Section */}
      {course.requirements && course.requirements.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Requirements</h2>
          <ul className="list-disc pl-5 space-y-2">
            {course.requirements.map((req, index) => (
              <li key={index}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Target Students Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Who This Course Is For</h2>
        <ul className="list-disc pl-5 space-y-2">
          {course.targetStudents.map((student, index) => (
            <li key={index}>{student}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
