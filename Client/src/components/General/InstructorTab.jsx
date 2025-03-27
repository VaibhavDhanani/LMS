import React from 'react';

export const InstructorTab = ({ course }) => {
  const instructor = course?.instructor || {};
  
  return (
      <div className="bg-base-100 shadow-xl rounded-xl overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Instructor Image Section */}
          <div className="flex justify-center items-center p-6 lg:p-8 bg-gray-50">
            <div className="relative w-48 h-48 lg:w-64 lg:h-64">
              <img
                  src={instructor.profilePicture || "/api/placeholder/300/300"}
                  alt={instructor.name || "Instructor"}
                  className="rounded-full w-full h-full object-cover shadow-lg"
              />
            </div>
          </div>
          
          {/* Instructor Details Section */}
          <div className="flex-1 p-6 lg:p-8">
            <div className="space-y-4">
              {/* Name and Title */}
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold">
                  {instructor.name || "Name not available"}
                </h2>
                {/* <p className="text-gray-600 mt-1 text-lg">
                  {instructor.title || "Title not provided"}
                </p> */}
              </div>
              
              {/* Stats Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
                {/* <div className="bg-base-200 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Student Rating</div>
                  <div className="text-2xl font-bold text-primary mt-1">
                    {instructor.rating !== undefined ? instructor.rating : "N/A"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Out of 5.0</div>
                </div> */}
                
                <div className="bg-base-200 p-4 rounded-lg">
                  <div className="text-sm text-gray-600">Total Courses</div>
                  <div className="text-2xl font-bold mt-1">
                    {instructor.createdCourses?.length}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">&nbsp;</div>
                </div>
              </div>
              
              {/* Biography Section */}
              <div>
                <h3 className="text-xl font-semibold mb-2">Biography</h3>
                <p className="text-gray-700 leading-relaxed">
                  {instructor.biography || "Biography not available."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};