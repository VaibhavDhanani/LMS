import React, { useState, useEffect } from "react";
import { Sparkles, Clock, Users, Heart, BookOpen, Globe } from 'lucide-react';
import { updateWishlist } from '@/services/user.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

const CourseCard = ({ course }) => {
  const { user, token } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const finalPrice = course.pricing?.discountEnabled
    ? course.pricing.price * (1 - course.pricing.discount / 100)
    : course.pricing?.price || 0;

  // Calculate total duration in hours and minutes format
  const getTotalDuration = () => {
    if (course.curriculum && course.curriculum.length > 0) {
      const totalMinutes = course.curriculum.reduce((total, section) => {
        return total + section.lectures.reduce((sectionTotal, lecture) => {
          return sectionTotal + (lecture.duration || 0);
        }, 0);
      }, 0);

      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours > 0) {
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
      }
      return `${minutes} min`;
    }
    return "0h:0m";
  };

  // Check if course is in user's wishlist whenever user changes
  useEffect(() => {
    if (user && user.wishlist && course._id) {
      setIsWishlisted(user.wishlist.some(item => item._id === course._id));
    } else {
      setIsWishlisted(false);
    }
  }, [user, course._id]);

  const handleWishlistToggle = async (e) => {
    e.preventDefault(); // Prevent event bubbling
    e.stopPropagation(); // Prevent parent click events

    if (!token) {
      toast.warn('Please log in to manage your wishlist');
      return;
    }

    if (isUpdating) return; // Prevent multiple clicks

    try {
      setIsUpdating(true);
      const isAdding = !isWishlisted;

      // Optimistic UI update
      setIsWishlisted(isAdding);

      // Call API to update wishlist
      const response = await updateWishlist(course._id, isAdding, token);

      if (response.success) {
        toast.success(isAdding ? 'Added to wishlist' : 'Removed from wishlist');
      } else {
        // Revert UI state if API call failed
        setIsWishlisted(!isAdding);
        toast.error(response.message || 'Failed to update wishlist');
      }
    } catch (error) {
      // Revert UI state on error
      setIsWishlisted(!isWishlisted);
      console.error('Error updating wishlist:', error);
      toast.error('Failed to update wishlist');
    } finally {
      setIsUpdating(false);
    }
  };

  // Count total lectures
  const getTotalLectures = () => {
    if (!course.curriculum) return 0;
    return course.curriculum.reduce((total, section) => {
      return total + (section.lectures?.length || 0);
    }, 0);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] relative">
      {/* Wishlist Button */}
      {user && (
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 z-10 p-2 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={isUpdating}
        >
          <Heart
            className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`}
          />
        </button>
      )}

      <div className="aspect-video w-full bg-gray-200 relative overflow-hidden">
        <img
          src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        {course.rating >= 4.5 && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 text-xs rounded-full">
            Top Rated
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            {/* Display Topics */}
            {course.topics && course.topics.length > 0 && (
              <>
                {course.topics.slice(0, 1).map((topic, index) => (
                  <span key={index} className="text-sm text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
                    {topic}
                  </span>
                ))}
                {course.topics.length > 1 && (
                  <span className="text-sm text-gray-600 font-medium">
                    +{course.topics.length - 1} more
                  </span>
                )}
              </>
            )}

            {/* Display Level if available */}
            {course.details?.level && (
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{course.details.level}</span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title || "Untitled Course"}</h3>

          <div className="flex items-center">
            <Sparkles className="w-5 h-5 text-yellow-400 mr-1" />
            <span className="text-gray-600">{course.rating ? course.rating : '0.0'}</span>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.subtitle || ""}</p>
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{getTotalDuration()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BookOpen className="w-4 h-4" />
            <span>{getTotalLectures()} lectures</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{course.enrolledStudents?.length || 0} students</span>
          </div>
          {course.details?.language && (
            <div className="flex items-center space-x-1">
              <Globe className="w-4 h-4" />
              <span>{course.details.language}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {course.instructor ? (
              <>
                <img
                  src={course.instructor.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070"}
                  alt={course.instructor.name}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium">{course.instructor.name || "Instructor"}</span>
              </>
            ) : (
              <span className="text-sm font-medium">Expert Instructor</span>
            )}
          </div>
          <div className="text-right">
            {course.pricing?.discountEnabled && course.pricing.price > 0 ? (
              <div>
                <span className="font-bold text-lg text-red-600">₹{finalPrice.toFixed(0)} </span>
                <span className="text-sm text-gray-500 line-through">₹{course.pricing.price.toFixed(0)}</span>
              </div>
            ) : course.pricing?.price > 0 ? (
              <span className="font-bold text-lg">₹{course.pricing.price.toFixed(0)}</span>
            ) : (
              <span className="font-bold text-lg text-green-600">Free</span>
            )}
          </div>
        </div>
        <div className="mt-4">
          <a
            href={`/courses/${course._id}`}
            className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
          >
            Explore Course
          </a>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;