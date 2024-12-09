import React from 'react';

export const InstructorTab = ({ course }) => {
  return (
    <div className="card lg:card-side bg-base-100 shadow-xl">
      <figure className="p-6">
        <img 
          src="/api/placeholder/300/300" 
          alt={course.instructor.name} 
          className="rounded-full w-64 h-64 object-cover" 
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{course.instructor.name}</h2>
        <p className="text-gray-600">{course.instructor.title}</p>
        
        <div className="stats shadow mt-4">
          <div className="stat">
            <div className="stat-title">Student Rating</div>
            <div className="stat-value text-primary">{course.instructor.rating}</div>
            <div className="stat-desc">Out of 5.0</div>
          </div>
          
          <div className="stat">
            <div className="stat-title">Total Students</div>
            <div className="stat-value">{course.instructor.totalStudents.toLocaleString()}</div>
          </div>
        </div>
        
        <p className="mt-4">{course.instructor.bio}</p>
      </div>
    </div>
  );
};