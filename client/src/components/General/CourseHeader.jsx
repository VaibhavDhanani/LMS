import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import VideoPlay from './VideoPlay';
import { paymentService,verifyPayment } from '@/services/payment.service';
import { useAuth } from '@/context/AuthContext';
import { createTransaction } from '@/services/enrollment.service';

export const CourseHeader = ({ course }) => {
  const { user, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const sessionId = queryParams.get('session_id');
  const status = queryParams.get('status');
  const [isEnrolled, setIsEnrolled] = useState(() =>
    course.enrolledStudents?.includes(user?.id)
  );
  console.log(course.enrolledStudents );
  const [loading, setLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState(null);
  useEffect(() => {
    if (sessionId) {
      (async () => {
        try {
          const response =await verifyPayment(sessionId,user.id,course._id,token);
          console.log(response.data);
          if (response.data.status === 'success' && response.data.courseId === course._id && response.data.userId===user.id) {
            setIsEnrolled(true);
            setPaymentMessage('Payment successful.')
            setPaymentError(null);
          } else {
            setIsEnrolled(false);
            if(status === 'success') {
              setPaymentError('Something went wrong');
            }else{
              setPaymentError('Payment failed. Please try again.');
            }
          }
          // await createTransaction(sessionId, token);
        } catch (error) {
          console.error('Error creating transaction:', error);
          setPaymentError('Something went wrong');
        }
      })();
    }
  }, [sessionId, token]);

  const handleBuyCourse = async () => {
    setLoading(true);
    setPaymentError(null);
    try {
      const response = await paymentService(course, user,token);
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
              <span className="text-3xl font-bold text-primary mr-4">
                ₹{finalPrice.toFixed(2)}
              </span>
              <span className="line-through text-gray-500">₹{course.pricing.price}</span>
            </div>
          ) : (
            <span className="text-3xl font-bold text-primary">
              ₹{course.pricing.price}
            </span>
          )}
          {isEnrolled ? (
            <button
              className="btn btn-success btn-wide mt-4 hover:bg-success-dark transition duration-200"
              onClick={() => navigate(`/enrolledcourses/${course._id}`)}
            >
              Go to Course
            </button>
          ) : (
            <button
              className={`btn btn-primary btn-wide mt-4 ${loading && 'opacity-50'}`}
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
        {paymentError && (
          <div className="mt-4 p-4 rounded bg-red-100 border border-red-300">
            <p className="text-red-600 font-medium">{paymentError}</p>
          </div>
        )}
        {paymentMessage && (
          <div className="mt-4 p-4 rounded bg-green-100 border border-green-300">
            <p className="text-green-600 font-medium">{paymentMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};
