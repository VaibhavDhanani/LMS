import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllCourse } from "@/services/course.service.jsx";

const Navigationbar = () => {
  const [allCourses, setAllCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.search-container')) {
        setIsSearching(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="navbar bg-base-100 border border-black">
      <div className="flex-1">
        <Link to={'/'} className="btn btn-ghost text-xl">
          LMS
        </Link>
      </div>

      {user && user.isInstructor && (
        <div className='flex'>
          <div className="flex-1">
            <a
              className="btn btn-ghost text-xl"
              onClick={() => navigate('/mycourses')}
            >
              My Courses
            </a>
          </div>
        </div>
      )}
      {user && !user.isInstructor && (
        <div className="flex-1">
          <a
            className="btn btn-ghost text-xl"
            onClick={() => navigate('/mylearnings')}
          >
            My Learnings
          </a>
        </div>
      )}
      {user &&(

        <div className="flex-1">
        <a
          className="btn btn-ghost text-xl"
          onClick={() => navigate('/livelectures/section')}
        >
          Live Lecture
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

        <div className="hidden md:flex">
          <ul className="menu menu-horizontal px-1">
            <li>
              <a>My Learning</a>
            </li>
            <li>
              <a>Watch List</a>
            </li>
          </ul>
        </div>

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
                  <a href="/user/profile" className="justify-between">
                    Profile
                    <span className="badge">New</span>
                  </a>
                </li>
                <li>
                  <a>Settings</a>
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
          >Login</button></a>

        )}
      </div>
    </div>
  );
};

export default Navigationbar;