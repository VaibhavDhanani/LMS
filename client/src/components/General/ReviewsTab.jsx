import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import {createReview} from "@/services/review.service.jsx";
import {useAuth} from "@/context/AuthContext.jsx";

export const ReviewsTab = ({ course }) => {
	const [showAllReviews, setShowAllReviews] = useState(false);
	const [userRating, setUserRating] = useState(0);
	const [hoverRating, setHoverRating] = useState(0);
	const [reviewComment, setReviewComment] = useState('');
	const {user} = useAuth();
	// console.log(course);
	
	// Get first 8 reviews
	const initialReviews = course.reviews.slice(0, 2);
	const remainingReviews = course.reviews.slice(2);
	
	const handleSubmitReview = async (e) => {
		e.preventDefault();
		const review = {
			content: reviewComment,
			rating: userRating,
			courseId: course._id,
			learnerId: user.id
		}
		const authToken = localStorage.getItem("authToken");
		const createdReview = await createReview(review,authToken);
		console.log({ createdReview});
		
	};
	
	return (
		<div className="space-y-8">
			{/* Reviews Display Section */}
			<div>
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-2xl font-bold">Course Reviews</h2>
					<span className="text-gray-600">
            {course.reviews.length} {course.reviews.length === 1 ? 'Review' : 'Reviews'}
          </span>
				</div>
				
				<div className="space-y-4">
					{/* Initial Reviews */}
					<div className="grid md:grid-cols-2 gap-4">
						{initialReviews.map((review) => (
							<div key={review._id} className="bg-base-100 shadow-xl rounded-xl p-6">
								<div className="flex items-center justify-between mb-3">
									<div className="flex items-center gap-3">
										<div className="avatar">
											<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
												{review.learnerId || "Vaibhav"}
												{/*// here profile photo will come*/}
											</div>
										</div>
										<span className="font-semibold">{review.learnerId || "Vaibhav"}</span>
									</div>
									<div className="flex text-yellow-500">
										{[...Array(5)].map((_, i) => (
											<Star
												key={i}
												size={16}
												fill={i < review.rating ? 'currentColor' : 'none'}
											/>
										))}
									</div>
								</div>
								<p className="text-gray-700">{review.content}</p>
							</div>
						))}
					</div>
					
					{/* Show More Button */}
					{remainingReviews.length > 0 && (
						<div className="text-center">
							<button
								className="btn btn-ghost gap-2"
								onClick={() => setShowAllReviews(!showAllReviews)}
							>
								{showAllReviews ? (
									<>Show Less <ChevronUp size={20} /></>
								) : (
									<>Show More Reviews <ChevronDown size={20} /></>
								)}
							</button>
						</div>
					)}
					
					{/* Additional Reviews */}
					{showAllReviews && (
						<div className="grid md:grid-cols-2 gap-4 mt-4">
							{remainingReviews.map((review) => (
								<div key={review.id} className="bg-base-100 shadow-xl rounded-xl p-6">
									<div className="flex items-center justify-between mb-3">
										<div className="flex items-center gap-3">
											<div className="avatar">
												<div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
													{review.learnerId || "vaibhav"} ||
												</div>
											</div>
											<span className="font-semibold">{review.learnerId}</span>
										</div>
										<div className="flex text-yellow-500">
											{[...Array(5)].map((_, i) => (
												<Star
													key={i}
													size={16}
													fill={i < review.rating ? 'currentColor' : 'none'}
												/>
											))}
										</div>
									</div>
									<p className="text-gray-700">{review.content}</p>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
			
			{/* Review Submission Section */}
			<div className="bg-base-100 shadow-xl rounded-xl p-6">
				<h3 className="text-xl font-bold mb-4">Write a Review</h3>
				<form onSubmit={handleSubmitReview} className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-2">Rating</label>
						<div className="flex gap-1">
							{[...Array(5)].map((_, index) => (
								<button
									key={index}
									type="button"
									className="text-yellow-500 transition-colors duration-150"
									onMouseEnter={() => setHoverRating(index + 1)}
									onMouseLeave={() => setHoverRating(0)}
									onClick={() => setUserRating(index + 1)}
								>
									<Star
										size={24}
										fill={(hoverRating || userRating) > index ? 'currentColor' : 'none'}
									/>
								</button>
							))}
						</div>
					</div>
					
					<div>
						<label className="block text-sm font-medium mb-2">Comment</label>
						<textarea
							value={reviewComment}
							onChange={(e) => setReviewComment(e.target.value)}
							className="textarea textarea-bordered w-full h-32"
							placeholder="Share your experience with this course..."
						/>
					</div>
					
					<button
						type="submit"
						className="btn btn-primary"
						disabled={!userRating || !reviewComment.trim()}
					>
						Submit Review
					</button>
				</form>
			</div>
		</div>
	);
};