import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import VideoPlay from './VideoPlay';
import { paymentService } from '@/services/payment.service';
import { useAuth } from '@/context/AuthContext';
import { createTransaction } from '@/services/enrollment.service';

export const CourseHeader = ({ course }) => {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get('status'); // Retrieve the `status` parameter
  const sessionId = queryParams.get('session_id');

  // Check if the user is already enrolled
  const initialEnrollment = useMemo(
    () => course.enrolledStudents?.includes(user?.id),
    [course.enrolledStudents, user?.id]
  );

  const [isEnrolled, setIsEnrolled] = useState(
    initialEnrollment || status === 'success'
  );
  const [loading, setLoading] = useState(false); // Track the loading state
  const [paymentError, setPaymentError] = useState(null); // Track payment error

  useEffect(() => {
    const enrollUser = async () => {
      if (isEnrolled && sessionId) {
        try {
          console.log('Enrolling');
          await createTransaction(sessionId, token);
        } catch (error) {
          console.error('Error creating transaction:', error);
        }
      }
    };
    enrollUser();
  }, [isEnrolled, sessionId]);

  // Function to handle buying the course
  const handleBuyCourse = async () => {
    setLoading(true); // Start loading
    setPaymentError(null); // Reset previous payment errors
    try {
      const response = await paymentService(course, user);
      if (response.error) {
        setPaymentError(response.error); // Set the error message
      } else {
        setIsEnrolled(true); // Trigger the enrollment
      }
    } catch (error) {
      setPaymentError('Payment failed. Please try again.'); // Set the error message
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const finalPrice = useMemo(() => {
    if (course.pricing.discountEnabled) {
      return course.pricing.price * (1 - course.pricing.discount / 100);
    }
    return course.pricing.price;
  }, [course]);

  return (
    <div className="grid md:grid-cols-2 gap-8 mb-12">
      <div className="bg-gray-200 rounded-lg">
        <VideoPlay src={course.promotionalVideo || ''} />
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <p className="text-xl text-gray-600 mb-4">{course.subtitle}</p>

        <div className="flex items-center mb-4">
          <img
            src={course.instructor?.profilePicture || '/default-avatar.png'}
            alt={course.instructor?.name || 'Instructor'}
            className="w-12 h-12 rounded-full mr-4"
          />
          <div>
            <p className="font-semibold">{course.instructor.name}</p>
            <p className="text-sm text-gray-500">{course.instructor.email}</p>
          </div>
        </div>

        <div className="flex items-center mb-4">
          <div className="flex text-yellow-500 mr-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={20}
                fill={i < Math.floor(course.rating) ? 'currentColor' : 'none'}
              />
            ))}
            <span className="text-gray-600 ml-2">{course.rating}</span>
          </div>
          <span className="text-gray-500">({course.reviews?.length || 0} reviews)</span>
        </div>

        <div className="mb-6">
          {course.pricing.discountEnabled ? (
            <div className="flex items-center">
              <span className="text-3xl font-bold text-primary mr-4">₹{finalPrice.toFixed(2)}</span>
              <span className="line-through text-gray-500">₹{course.pricing.price}</span>
            </div>
          ) : (
            <div>
              <span className="text-3xl font-bold text-primary">₹{course.pricing.price}</span>
            </div>
          )}

          {/* Button changes based on enrollment status */}
          {isEnrolled ? (
            <button
              className="btn btn-success btn-wide mt-4 hover:bg-success-dark transition duration-200"
              onClick={() => navigate(`/enrolledcourses/${course._id}`)}
            >
              Go to Course
            </button>
          ) : (
            <button
              className={`btn btn-primary btn-wide mt-4 hover:bg-primary-dark transition duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleBuyCourse}
              disabled={loading} // Disable the button while loading
            >
              {loading ? (
                <div className="animate-spin border-t-2 border-white rounded-full w-6 h-6 mr-2" />
              ) : (
                'Enroll Now'
              )}
            </button>
          )}
        </div>

        {/* Display message based on query status */}
        {status && (
          <div className="mt-4 p-4 rounded bg-gray-100 border border-gray-300">
            {status === 'success' && (
              <p className="text-green-600 font-medium">Payment successful! You are now enrolled.</p>
            )}
            {status === 'cancel' && (
              <p className="text-red-600 font-medium">Payment failed. Please try again.</p>
            )}
          </div>
        )}

        {/* Display payment error message if any */}
        {paymentError && (
          <div className="mt-4 p-4 rounded bg-red-100 border border-red-300">
            <p className="text-red-600 font-medium">{paymentError}</p>
          </div>
        )}
      </div>
    </div>
  );
};
