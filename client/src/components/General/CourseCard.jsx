import React,{useMemo} from 'react';
const CourseCard = ({ course }) => {
	const { title, description, pricing, _id } = course;
	
	const finalPrice = useMemo(() => {
		if (pricing.discountEnabled) {
			return pricing.price * (1 - pricing.discount / 100);
		}
		return pricing.price;
	}, [pricing]);
	
	return (
		<div className="card card-compact bg-base-100 w-60 shadow-xl flex-shrink-0">
			{/* Course Thumbnail */}
			<figure>
				<img
					src={course.thumbnail}
					alt={title || "Course Thumbnail"}
					className="h-40 w-full object-cover"
				/>
			</figure>
			
			{/* Course Details */}
			<div className="card-body">
				{/* Course Title */}
				<h2 className="card-title">{title || "Untitled Course"}</h2>
				
				{/* Course Description */}
				<p>{description || "No description available for this course."}</p>
				
				{/* Pricing Information */}
				{pricing?.price && (
					<p className="text-sm font-medium text-red-600">
						<span>Price: ₹{finalPrice} </span>
						{(pricing.discountEnabled) &&
							<span className="line-through text-gray-500 mr-2">₹{pricing.price}</span>
						}
					</p>
				)}
				{/* Explore Button */}
				<div className="card-actions justify-end">
					<a className="btn btn-accent" href={`/courses/${_id}`}>
						Explore
					</a>
				</div>
			</div>
		</div>
	);
};

export default CourseCard;
