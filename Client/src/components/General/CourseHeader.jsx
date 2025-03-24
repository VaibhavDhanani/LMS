import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import VideoPlay from './VideoPlay';
import { paymentService, verifyPayment } from '@/services/payment.service';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';  // Importing toast
import 'react-toastify/dist/ReactToastify.css'; // Importing styles
import { updateWishlist } from '@/services/user.service';
export const CourseHeader = ({ course }) => {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session_id');
  const status = queryParams.get('status');
  const [isEnrolled, setIsEnrolled] = useState(() =>
    course.enrolledStudents?.includes(user?._id)
  );
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  

  useEffect(() => {
    if (user && user.wishlist && course?._id) {
      setIsWishlisted(user.wishlist.some(item => item._id === course._id));
    } else {
      setIsWishlisted(false);
    }
  }, [user, course]);

  const handleWishlistToggle = async () => {
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

  useEffect(() => {
    if (sessionId) {
      (async () => {
        try {
          const response = await verifyPayment(sessionId, course._id, token);
          if (response.data.status === 'success' && response.data.courseId === course._id && response.data.userId === user._id) {
            setIsEnrolled(true);
            setPaymentMessage('Payment successful.')
            setPaymentError(null);
          } else {
            setIsEnrolled(false);
            if (status === 'success') {
              setPaymentError('Something went wrong');
            } else {
              setPaymentError('Payment failed. Please try again.');
            }
          }
        } catch (error) {
          console.error('Error creating transaction:', error);
          setPaymentError('Something went wrong');
        }
      })();
    }
  }, [sessionId, token, user, course._id]);

  const handleBuyCourse = async () => {
    if (!user) {
      toast.warn('Please log in to enroll in this course.');
      navigate('/auth'); // Redirect to login page
      return;
    }
    if (user.isInstructor) {
      toast.warn('Instructors cannot enroll in courses.');
      return;
    }

    setLoading(true);
    setPaymentError(null);

    try {
      const response = await paymentService(course, token);
      if (response.error) {
        setPaymentError(response.error);
      }
    } catch (error) {
      setPaymentError('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };


  const finalPrice = useMemo(() => {
    const { price, discount, discountEnabled } = course.pricing;
    return discountEnabled ? price * (1 - discount / 100) : price;
  }, [course.pricing]);

  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Video/Thumbnail Container */}
        <div className="w-full aspect-video relative rounded-lg overflow-hidden bg-gray-200">
          <div className="absolute inset-0">
            <VideoPlay
              thumbnail={course.thumbnail}
              src={course.promotionalVideo || ''}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Course Information */}
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
            
              {/* Wishlist button - only show if user is logged in */}
            {user && (
              <button 
                onClick={handleWishlistToggle}
                className={`p-2 rounded-full hover:bg-gray-100 transition-all ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isUpdating}
              >
                <Heart 
                  size={28} 
                  className={`${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
                />
              </button>
            )}
          </div>
          
          
          <p className="text-lg md:text-xl text-gray-600">{course.subtitle}</p>

          {/* Instructor Info */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 relative rounded-full overflow-hidden flex-shrink-0">
              <img
                src={course.instructor?.profilePicture || '/default-avatar.png'}
                alt={course.instructor?.name || 'Instructor'}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <p className="font-semibold">{course.instructor.name}</p>
              <p className="text-sm text-gray-500">{course.instructor.email}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center flex-wrap gap-4">
            <div className="flex items-center text-yellow-500">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className="flex-shrink-0"
                  fill={i < Math.floor(course.rating) ? 'currentColor' : 'none'}
                />
              ))}
              <span className="ml-2 text-gray-600">{course.rating}</span>
            </div>
            <span className="text-gray-500">({course.reviews?.length || 0} reviews)</span>
          </div>

          {/* Pricing */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center flex-wrap gap-4">
              {course.pricing.discountEnabled ? (
                <>
                  <span className="text-2xl md:text-3xl font-bold text-primary">
                    ₹{finalPrice.toFixed(2)}
                  </span>
                  <span className="line-through text-gray-500">
                    ₹{course.pricing.price}
                  </span>
                </>
              ) : (
                <span className="text-2xl md:text-3xl font-bold text-primary">
                  ₹{course.pricing.price}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {isEnrolled || (user && course.instructor._id === user.id) ? (
                <button
                  className="w-full sm:w-auto btn btn-success px-8 hover:bg-success-dark transition duration-200"
                  onClick={() => navigate(`/mylearnings/${course._id}`)}
                >
                  Go to Course
                </button>
              ) : (
                <button
                  className={`w-full sm:w-auto btn btn-primary px-8 ${loading && 'opacity-50'}`}
                  onClick={handleBuyCourse}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="animate-spin border-t-2 border-white rounded-full w-6 h-6" />
                  ) : (
                    'Enroll Now'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          {paymentError && (
            <div className="p-4 rounded bg-red-100 border border-red-300">
              <p className="text-red-600 font-medium">{paymentError}</p>
            </div>
          )}
          {paymentMessage && (
            <div className="p-4 rounded bg-green-100 border border-green-300">
              <p className="text-green-600 font-medium">{paymentMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};