import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCourse } from "@/services/course.service.jsx";
import { useNotifications } from '@/context/NotificationContext';

const Navigationbar = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const fetchAllCourses = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const courses = await getAllCourse(authToken);
      return courses;
    } catch (error) {
      console.error("Error fetching courses:", error);
      return [];
    }
  };

  useEffect(() => {
    const getCourses = async () => {
      const courses = await fetchAllCourses();
      setAllCourses(Array.isArray(courses) ? courses : []);
    };
    getCourses();
  }, []);

  // Handle search functionality
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const filteredCourses = allCourses.filter(course =>
      course?.title?.toLowerCase().includes(query.toLowerCase()) ||
      course?.description?.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filteredCourses);
    setIsSearching(true);
  };

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setIsSearching(false);
      }
      if (!event.target.closest('.notification-container') && isNotificationsOpen) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Stop the click event from bubbling up

    markAsRead(notification._id);

    // Navigate to the relevant page based on notification type
    if (notification.link) {
      navigate(notification.link);
    }

    setIsNotificationsOpen(false);
  };

  // Format notification time
  const formatNotificationTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className="navbar bg-base-100 border border-black">
      <div className="flex-1">
        <Link to={'/'} className="btn btn-ghost text-xl">
          LMS
        </Link>
      </div>

      {user && user.isInstructor && (
        <>
          <div className="flex-1">
            <a
              className="btn btn-ghost text-xl"
              onClick={() => navigate('/mycourses')}
            >
              My Courses
            </a>
          </div>
          <div className="flex-1">
            <a
              className="btn btn-ghost text-xl"
              onClick={() => navigate('/sales')}
              >
            Sales
            </a>
          </div>
              </>
      )}
      {user && !user.isInstructor && (
          <>
        <div className="flex-1">
          <a
            className="btn btn-ghost text-xl"
            onClick={() => navigate('/mylearnings')}
          >
            My Learnings
          </a>
        </div>
        <div className="flex-1">
        <a
          className="btn btn-ghost text-xl"
          onClick={() => navigate('/transactions')}
        >
           Transactions
        </a>
      </div>
      </>
      )}
      {user && (
        <div className="flex-1">
          <a
            className="btn btn-ghost text-xl"
            onClick={() => navigate('/livelectures/section')}
          >
            Live Lectures
          </a>
        </div>
      )}

      <div className="flex-none gap-2">
        <div className="form-control relative search-container">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => setIsSearching(true)}
            className="input input-bordered w-24 md:w-auto"
          />

          {/* Search Results Dropdown */}
          {isSearching && searchResults.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-base-100 shadow-lg rounded-lg border border-gray-200 max-h-64 overflow-y-auto z-50">
              {searchResults.map((course) => (
                <div
                  key={course._id || course.id}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    navigate(`/courses/${course._id || course.id}`);
                    setIsSearching(false);
                    setSearchQuery('');
                  }}
                >
                  <div className="font-medium">
                    {course.title || 'Untitled Course'}
                  </div>
                  {course.instructor && (
                    <div className="text-sm text-gray-500">
                      {typeof course.instructor === 'object'
                        ? course.instructor.email || 'Unknown Instructor'
                        : course.instructor}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {isSearching && searchQuery && searchResults.length === 0 && (
            <div className="absolute top-full mt-1 w-full bg-base-100 shadow-lg rounded-lg border border-gray-200 p-2">
              No courses found
            </div>
          )}
        </div>

        {/* Notifications */}
        {user && (
          <div className="dropdown dropdown-end notification-container">
            <div
              tabIndex={0}
              role="button"
              className="btn btn-ghost btn-circle"
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            >
              <div className="indicator">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="badge badge-sm badge-primary indicator-item">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            </div>
            {isNotificationsOpen && (
              <div className="mt-3 z-[1] card card-compact dropdown-content w-80 bg-base-100 shadow-lg">
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="divider my-0"></div>
                  {notifications.length === 0 ? (
                    <div className="py-4 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <button
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`w-full text-left p-2 hover:bg-gray-100 cursor-pointer border-b ${!notification.isRead ? 'bg-blue-50' : ''
                            }`}
                        >
                          <div className="flex justify-between">
                            <h4
                              className={`font-medium ${!notification.isRead ? 'font-bold text-blue-800' : ''
                                }`}
                            >
                              {notification.title || 'Notification'}
                            </h4>
                            <span className="text-xs text-gray-500">
                              {formatNotificationTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm">{notification.message}</p>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="card-actions mt-2">
                    <button
                      className="btn btn-primary btn-sm btn-block"
                      onClick={() => {
                        navigate('/notifications');
                        setIsNotificationsOpen(false);
                      }}
                    >
                      View All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


        <div className="dropdown dropdown-end">
          <div
            tabIndex={0}
            role="button"
            className="btn btn-ghost btn-circle avatar"
          >
            <div className="w-10 rounded-full">
              <img
                alt="User Avatar"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
          >
            {user ? (
              <>
                <li>
                  <a href= {user.isInstructor?"/instructor/profile":"/user/profile"} className="justify-between">
                    Profile
                  </a>
                </li>
                <li>
                  <a>WishList</a>
                </li>
                <li>
                  <button onClick={logout}>Logout</button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <a href="/auth">Login</a>
                </li>
                <li>
                  <a href="/auth">Sign Up</a>
                </li>
              </>
            )}
          </ul>
        </div>

        {user ? (
          <button
            onClick={logout}
            className="btn btn-error ml-4 hidden md:block"
          >
            Logout
          </button>
        ) : (
          <a href="/auth">
            <button
              className="btn btn-error ml-4 hidden md:block"
            >Login</button>
          </a>
        )}
      </div>
    </div>
  );
};

export default Navigationbar;