import React from 'react';

export const CurriculumTab = ({ course }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Course Curriculum</h2>
      {course.curriculum.map((section, index) => (
        <div key={index} className="collapse collapse-arrow border border-base-300 bg-base-100 rounded-box mb-4">
          <input type="radio" name="my-accordion-2" defaultChecked={index === 0} /> 
          <div className="collapse-title text-xl font-medium">
            {section.section}
          </div>
          <div className="collapse-content"> 
            <ul className="space-y-2">
              {section.lectures.map((lecture, lectureIndex) => (
                <li 
                  key={lectureIndex} 
                  className="flex justify-between items-center p-2 bg-base-200 rounded"
                >
                  <div className="flex items-center">
                    {lecture.preview && (
                      <span className="badge badge-primary mr-2">Preview</span>
                    )}
                    {lecture.title}
                  </div>
                  <span>{lecture.duration}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};