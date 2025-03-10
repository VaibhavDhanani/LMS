import React, { useState, useEffect } from "react";
import { Clock, Users, Heart } from 'lucide-react';
import { updateWishlist } from '@/services/user.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

const CourseCard = ({ course }) => {
  const { user, token } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const finalPrice = course.pricing?.discountEnabled 
    ? course.pricing.price * (1 - course.pricing.discount / 100) 
    : course.pricing?.price || course.price || 0;

  // Check if course is in user's wishlist whenever user changes
  useEffect(() => {
    if (user && user.wishlist && course._id) {
      setIsWishlisted(user.wishlist.includes(course._id));
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
        {course.featured && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 text-xs rounded-full">
            Featured
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-sm text-blue-600 font-medium">{course.category || "General"}</span>
          {course.level && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{course.level}</span>
          )}
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title || "Untitled Course"}</h3>  
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{course.TotalMinutes || "8 hours"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{course.enrolledStudents?.length || 0} students</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={course.instructor?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070"}
              alt={course.instructor?.name}
              className="w-8 h-8 rounded-full"
            />
            <span className="text-sm font-medium">{course.instructor?.name || "Instructor"}</span>
          </div>
          <div className="text-right">
            {course.pricing?.discountEnabled && course.pricing.price ? (
              <div>
                <span className="font-bold text-lg text-red-600">₹{finalPrice} </span>
                <span className="text-sm text-gray-500 line-through">₹{course.pricing.price}</span>
              </div>
            ) : (
              <span className="font-bold text-lg">₹{finalPrice}</span>
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