import React from "react";
import CourseCard from "../General/CourseCard";

const MainSection = () => {
  const data = [
    {
      title: "Your Learning",
      content: [
        "Python",
        "Java",
        "C++",
        "Ruby",
        "Python",
        "Java",
        "C++",
        "Ruby",
      ],
    },
    {
      title: "Your Learning",
      content: [
        "Python",
        "Java",
        "C++",
        "Ruby",
        "Python",
        "Java",
        "C++",
        "Ruby",
      ],
    },
    {
      title: "Your Learning",
      content: [
        "Python",
        "Java",
        "C++",
        "Ruby",
        "Python",
        "Java",
        "C++",
        "Ruby",
      ],
    },
    {
      title: "Your Learning",
      content: [
        "Python",
        "Java",
        "C++",
        "Ruby",
        "Python",
        "Java",
        "C++",
        "Ruby",
      ],
    },
  ];

  return (
    <div className="p-4 space-y-8">
      {data.map((section, index) => (
        <div key={index} className="space-y-4">
          <h2 className="text-2xl font-bold">{section.title}</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {section.content.map((course, idx) => (
              <CourseCard key={idx} course={course} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MainSection;
