import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCourse } from "@/services/course.service.jsx";
import { useNotifications } from '@/context/NotificationContext';
import { 
  Search, Bell, Menu, X, 
  BookOpen, CreditCard, Video, 
  LogOut, Home 
} from 'lucide-react';
import ProfileDropdown from './ProfileDropDown';

const Navigationbar = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { unreadNotifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const fetchAllCourses = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      const { data } = await getAllCourse(authToken);
      return data;
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const filteredCourses = allCourses.filter(course =>
      course?.title?.toLowerCase().includes(query.toLowerCase()) ||
      course?.subtitle?.toLowerCase().includes(query.toLowerCase())||
      course?.instructor.name?.toLowerCase().includes(searchQuery.toLowerCase())||
      course?.instructor.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filteredCourses);
    setIsSearching(true);
  };

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

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id);
    if (notification.link) {
      navigate(notification.link);
    }
    setIsNotificationsOpen(false);
  };

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

  // Previous methods remain the same (fetchAllCourses, handleSearch, formatNotificationTime, etc.)
  // ... (copy over the previous implementation)

  const MobileMenu = () => {
    const menuItems = [
      { 
        icon: <Home className="w-5 h-5" />, 
        text: 'Home', 
        path: '/' 
      },
      ...(user && user.isInstructor ? [
        { 
          icon: <BookOpen className="w-5 h-5" />, 
          text: 'My Courses', 
          path: '/mycourses' 
        },
        { 
          icon: <CreditCard className="w-5 h-5" />, 
          text: 'Sales', 
          path: '/sales' 
        }
      ] : user ? [
        { 
          icon: <BookOpen className="w-5 h-5" />, 
          text: 'My Learnings', 
          path: '/mylearnings' 
        },
        { 
          icon: <CreditCard className="w-5 h-5" />, 
          text: 'Transactions', 
          path: '/transactions' 
        }
      ] : []),
      ...(user ? [
        { 
          icon: <Video className="w-5 h-5" />, 
          text: 'Live Lectures', 
          path: '/livelecture/section' 
        },
        // { 
        //   icon: <LogOut className="w-5 h-5" />, 
        //   text: 'Logout', 
        //   action: () => {
        //     logout();
        //     navigate('/login');
        //   } 
        // }
      ] : [])
    ];

    return (
      <div className="lg:hidden fixed inset-0 z-50 bg-white">
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                LearnSpace
              </span>
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Menu Items */}
          <div className="flex-1 overflow-y-auto">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                onClick={() => {
                  if (item.action) item.action();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center space-x-3 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                {item.icon}
                <span className="text-gray-800">{item.text}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                LearnSpace
              </span>
            </Link>

            {/* Mobile Menu Toggle (Only on small screens) */}
            <div className="lg:hidden flex items-center space-x-4">
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

            {/* Main Navigation - Hidden on small screens */}
            <div className="hidden lg:flex items-center space-x-8">
              {user && user.isInstructor ? (
                <>
                  <Link to="/mycourses" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <BookOpen className="w-5 h-5" />
                    <span>My Courses</span>
                  </Link>
                  <Link to="/sales" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <CreditCard className="w-5 h-5" />
                    <span>Sales</span>
                  </Link>
                </>
              ) : user && (
                <>
                  <Link to="/mylearnings" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <BookOpen className="w-5 h-5" />
                    <span>My Learnings</span>
                  </Link>
                  <Link to="/transactions" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                    <CreditCard className="w-5 h-5" />
                    <span>Transactions</span>
                  </Link>
                </>
              )}
              {user && (
                <Link to="/livelecture/section" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                  <Video className="w-5 h-5" />
                  <span>Live Lectures</span>
                </Link>
              )}
            </div>

  
          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative search-container">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setIsSearching(false);
                      navigate(`/courses?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  onFocus={() => setIsSearching(true)}
                  className="pl-10 pr-10 py-2 w-full md:w-64 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* Clear Button */}
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setIsSearching(false);
                      navigate('/courses', { replace: true }); // Clears query from URL
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>


              {isSearching && searchResults.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {searchResults.map((course) => (
                    <div
                      key={course._id || course.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        navigate(`/courses/${course._id || course.id}`);
                        setIsSearching(false);
                        setSearchQuery('');
                      }}
                    >
                      <div className="font-medium text-gray-900">
                        {course.title || 'Untitled Course'}
                      </div>
                      {course.instructor && (
                        <div className="text-sm text-gray-500">
                          {typeof course.instructor === 'object'
                            ? `${course.instructor.name}(${course.instructor.email})`  || 'Unknown Instructor'
                            : course.instructor}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isSearching && searchQuery && searchResults.length === 0 && (
                <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-center text-gray-500">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  Search for "{searchQuery}"
                </div>
              )}
            </div>

            {/* Notifications */}
            {user && (
              <div className="relative notification-container">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-full hover:bg-gray-100"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                      {unreadNotifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                          No notifications
                        </div>
                      ) : (
                        unreadNotifications.map((notification) => (
                          <button
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full text-left p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${!notification.isRead ? 'bg-blue-50' : ''
                              }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className={`font-medium ${!notification.isRead ? 'text-blue-900' : 'text-gray-900'
                                  }`}>
                                  {notification.title || 'Notification'}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              </div>
                              <span className="text-xs text-gray-500 ml-2">
                                {formatNotificationTime(notification.createdAt)}
                              </span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>

                    <div className="p-4 border-t border-gray-200">
                      <button
                        onClick={() => {
                          navigate('/notifications');
                          setIsNotificationsOpen(false);
                        }}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        View Past Notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Menu */}
            <div className="relative">
                <ProfileDropdown></ProfileDropdown>
                              
            </div>
          </div>
        </div>
      </div>
    </nav >
        {/* Mobile Menu */}
        {isMobileMenuOpen && <MobileMenu />}
    </>
  
  );
};

export default Navigationbar;