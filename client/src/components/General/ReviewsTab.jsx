import React from 'react';
import { Star } from 'lucide-react';

export const ReviewsTab = ({ course }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Course Reviews</h2>
      <div className="grid md:grid-cols-2 gap-4">
        {course.reviews.map((review) => (
          <div key={review.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center mb-2">
                <div className="flex text-yellow-500 mr-4">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      fill={i < review.rating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
                <span className="font-semibold">{review.userName}</span>
              </div>
              <p>{review.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};