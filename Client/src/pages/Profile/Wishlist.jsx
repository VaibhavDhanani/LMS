import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';

const Wishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch wishlist items
    const fetchWishlist = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch(`/api/wishlist/${user.id}`);
        const data = await response.json();
        setWishlistItems(data);
      } catch (error) {
        console.error('Failed to fetch wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user.id]);

  const removeFromWishlist = async (itemId) => {
    try {
      // Replace with your actual API call
      await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
      });
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

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
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{item.instructor}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;