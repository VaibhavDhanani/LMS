import React from 'react';
import { Star } from 'lucide-react';
import VideoPlay from './VideoPlay';
import { loadStripe } from '@stripe/stripe-js';


export const CourseHeader = ({ course }) => {
  const stripePublishKey = import.meta.env.VITE_STRIPE_PUBLISHKEY
  const apiUrl = import.meta.env.VITE_SERVER_URL

  const handleBuyCourse = async () => {
    const stripe = await loadStripe(stripePublishKey)
    const response = await fetch(`${apiUrl}/checkout`,{
      method: 'POST',
      headers: {
        'Content-Type': "application/json"
      },
      body: JSON.stringify(course)
    })
    const session = await response.json();

    const result = stripe.redirectToCheckout({
      sessionId: session.id
    })
    if(result.error){
      console.log(error.message)
    }
  }

  console.log(course)

  return (
    <div className="grid md:grid-cols-2 gap-8 mb-12">
      <div className="bg-gray-200 rounded-lg">
        <VideoPlay src={`${course.promotionalVideo}`} />
      </div>
      
      <div>
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <p className="text-xl text-gray-600 mb-4">{course.subtitle}</p>
        
        <div className="flex items-center mb-4">
          <img 
            src="/api/placeholder/50/50" 
            alt={course.instructor}
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
            <span className="text-3xl font-bold text-primary mr-4">${course.pricing.discount}</span>
            <span className="line-through text-gray-500">${course.pricing.price}</span>
          </div>
          <button className="btn btn-primary btn-wide mt-4" onClick={handleBuyCourse}>Enroll Now</button>
        </div>
      </div>
    </div>
  );
};