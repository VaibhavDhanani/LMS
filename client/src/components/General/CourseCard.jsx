import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  return (
    <div className="card card-compact bg-base-100 w-60 shadow-xl flex-shrink-0">
      <figure>
        <img
          src={`${course.thumbnail}`}
          alt="Course"
          className="h-40 w-full object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{course.title}</h2>
        <p>{course.description}</p>
        <div className="card-actions justify-end">
          <Link
            className="btn-custom btn-active btn-accent"
            to={`/courses/${course._id}`}
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
