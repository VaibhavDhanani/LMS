import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import CourseCard from '@/components/General/CourseCard';
const Wishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setWishlistItems(user.wishlist);
    setLoading(false);
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <Heart className="w-8 h-8 text-indigo-600 mr-3" />
          <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No items in wishlist</h3>
            <p className="mt-1 text-sm text-gray-500">Start adding courses to your wishlist!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistItems.map((course) => (
              
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;