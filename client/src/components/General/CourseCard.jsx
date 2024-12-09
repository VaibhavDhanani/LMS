import React from "react";

const CourseCard = ({ course }) => {
  return (
    <div
      className="card card-compact bg-base-100 w-60 shadow-xl flex-shrink-0"
    >
      <figure>
        <img
          src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
          alt="Course"
          className="h-40 w-full object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{course}</h2>
        <p>Enhance your skills with this amazing course.</p>
        <div className="card-actions justify-end">
          <a className="btn-custom btn-active btn-accent" href="/courses/1">Explore</a>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
