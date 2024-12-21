import React from 'react';

export const InstructorTab = ({ course }) => {
  const instructor = course?.instructor || {};

  return (
    <div className="card lg:card-side bg-base-100 shadow-xl">
      <figure className="p-6">
        <img
          src={instructor.imageUrl || "/api/placeholder/300/300"}
          alt={instructor.name || "Instructor"}
          className="rounded-full w-64 h-64 object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{instructor.name || "Name not available"}</h2>
        <p className="text-gray-600">{instructor.title || "Title not provided"}</p>

        <div className="stats shadow mt-4">
          <div className="stat">
            <div className="stat-title">Student Rating</div>
            <div className="stat-value text-primary">
              {instructor.rating !== undefined ? instructor.rating : "N/A"}
            </div>
            <div className="stat-desc">Out of 5.0</div>
          </div>

          <div className="stat">
            <div className="stat-title">Total Students</div>
            <div className="stat-value">
              {instructor.totalStudents !== undefined
                ? instructor.totalStudents.toLocaleString()
                : "N/A"}
            </div>
          </div>
        </div>

        <p className="mt-4">{instructor.bio || "Biography not available."}</p>
      </div>
    </div>
  );
};
