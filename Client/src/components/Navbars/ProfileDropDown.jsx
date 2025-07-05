import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { User, Settings, Heart, LogOut, LogIn, ChevronDown } from 'lucide-react';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will be handled by AuthContext
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleLogin =  () => {
    try {
    navigate('/auth');
      // Redirect will be handled by AuthContext
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-indigo-600" />
          )}
        </div>
        {user ? (
          <span className="hidden md:block font-medium">{user.displayName || user.email}</span>
        ) : (
          <span className="hidden md:block font-medium">
            {/* Guest */}
            </span>
        )}
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          {user ? (
            // Authenticated user menu
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1 ring-1 ring-black ring-opacity-5">
              <Link
                to="/profile"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 mr-3" />
                My Profile
              </Link>
              <Link
                to="/profile/settings"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4 mr-3" />
                Account Settings
              </Link>
              <Link
                to="/profile/wishlist"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <Heart className="w-4 h-4 mr-3" />
                Wishlist
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          ) : (
            // Guest user menu
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 py-1 ring-1 ring-black ring-opacity-5">
              <button
                onClick={handleLogin}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <LogIn className="w-4 h-4 mr-3" />
                Login / Signup
              </button>
              {/* <Link
                to="/register"
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <User className="w-4 h-4 mr-3" />
                Create Account
              </Link> */}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProfileDropdown;