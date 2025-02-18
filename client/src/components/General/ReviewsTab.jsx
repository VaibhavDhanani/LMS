import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { createReview } from "@/services/review.service.jsx";
import { useAuth } from "@/context/AuthContext.jsx";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const ReviewsTab = ({ course }) => {
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const { user } = useAuth();

    const isEnrolled = course.enrolledStudents?.includes(user?.id);
    const isInstructor = course.instructor._id === user?.id;

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        // Show toast warning if user is the instructor
        if (isInstructor) {
            toast.warn("Instructors cannot submit reviews for their own courses.");
            return;
        }
        // Show toast warning if user is not enrolled
        if (!isEnrolled) {
            toast.warn("You must be enrolled in this course to leave a review.");
            return;
        }


        const review = {
            content: reviewComment,
            rating: userRating,
            courseId: course._id,
            learnerId: user.id
        };

        const authToken = localStorage.getItem("authToken");
        try {
            const createdReview = await createReview(review, authToken);
            console.log({ createdReview });

            // Success toast
            toast.success("Review submitted successfully!");

            // Clear input fields after submission
            setUserRating(0);
            setReviewComment('');
        } catch (error) {
            toast.error("Failed to submit review. Please try again.");
        }
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
                        {course.reviews.slice(0, 2).map((review) => (
                            <div key={review._id} className="bg-base-100 shadow-xl rounded-xl p-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                {review.learnerId || "John Doe"}
                                            </div>
                                        </div>
                                        <span className="font-semibold">{review.learnerId || "John doe"}</span>
                                    </div>
                                    <div className="flex text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-700">{review.content}</p>
                            </div>
                        ))}
                    </div>

                    {/* Show More Button */}
                    {course.reviews.length > 2 && (
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
                            {course.reviews.slice(2).map((review) => (
                                <div key={review._id} className="bg-base-100 shadow-xl rounded-xl p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="avatar">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    {review.learnerId || "Vaibhav"}
                                                </div>
                                            </div>
                                            <span className="font-semibold">{review.learnerId}</span>
                                        </div>
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={16} fill={i < review.rating ? 'currentColor' : 'none'} />
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
                                    <Star size={24} fill={(hoverRating || userRating) > index ? 'currentColor' : 'none'} />
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
