import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { updateWishlist } from '@/services/user.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

const CourseCard = ({ course }) => {
  const { title, description, pricing, _id } = course;
  const { user, token } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const finalPrice = pricing?.discountEnabled 
    ? pricing.price * (1 - pricing.discount / 100) 
    : pricing?.price;

  // Check if course is in user's wishlist whenever user changes
  useEffect(() => {
    if (user && user.wishlist && _id) {
      setIsWishlisted(user.wishlist.includes(_id));
    } else {
      setIsWishlisted(false);
    }
  }, [user, _id]);
  
  const handleWishlistToggle = async (e) => {
    e.preventDefault(); // Prevent event bubbling
    
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
      const response = await updateWishlist(_id, isAdding, token);
      
      if (response.success) {
        // Notify parent component about the change if needed
        // Optional toast notification
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
    <div className="card card-compact bg-base-100 w-60 shadow-xl flex-shrink-0 relative">
      {user && (
        <button 
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 z-10 p-2 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-all ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          disabled={isUpdating}
        >
          <Heart 
            size={20} 
            className={`${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
          />
        </button>
      )}
      
      {/* Course Thumbnail */}
      <figure>
        <img
          src={course.thumbnail || "/api/placeholder/300/200"}
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
        
        {/* Action Buttons */}
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