import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import VideoPlay from './VideoPlay';
import { loadStripe } from '@stripe/stripe-js';

export const CourseHeader = ({ course }) => {
  const stripePublishKey = import.meta.env.VITE_STRIPE_PUBLISHKEY;
  const apiUrl = import.meta.env.VITE_SERVER_URL;

  const handleBuyCourse = async () => {
    const stripe = await loadStripe(stripePublishKey);
    const response = await fetch(`${apiUrl}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(course),
    });
    const session = await response.json();

    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });
    if (result.error) {
      console.log(result.error.message);
    }
  };

  const finalPrice = useMemo(() => {
    if (course.pricing?.discountEnabled === true) {
      const discount = (course.pricing.price * course.pricing.discount) / 100;
      return course.pricing.price - discount;
    }
    return course.pricing?.price || 0;
  }, [course.pricing]);

  const discountPercentage = useMemo(() => {
    if (course.pricing?.discountEnabled === true) {
      return course.pricing.discount;
    }
    return 0;
  }, [course.pricing]);

  console.log(course)

  return (
    <div className="grid md:grid-cols-2 gap-8 mb-12">
      <div className="bg-gray-200 rounded-lg">
        <VideoPlay src={course.promotionalVideo} />
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <p className="text-xl text-gray-600 mb-4">{course.subtitle}</p>

        <div className="flex items-center mb-4">
          <img
            src="/api/placeholder/50/50"
            alt={course.instructor.name}
            className="w-12 h-12 rounded-full mr-4"
          />
          <div>
            <p className="font-semibold">{course.instructor}</p>
            <p className="text-sm text-gray-500">{course.instructor}</p>
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
          <span className="text-gray-500">({course.reviews.length} reviews)</span>
        </div>

        <div className="mb-6">
          <div className="flex items-center">
            {discountPercentage > 0 ? (
              <>
                <span className="text-3xl font-bold text-primary mr-4">${finalPrice}</span>
                <span className="line-through text-gray-500">${course.pricing.price}</span>
                <span className="text-green-500 font-semibold ml-2">{ discountPercentage}%</span>
              </>
            ) : (
              <span className="text-3xl font-bold text-primary mr-4">${course.pricing.price}</span>
            )}
          </div>
          <button className="btn btn-primary btn-wide mt-4" onClick={handleBuyCourse}>
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};
