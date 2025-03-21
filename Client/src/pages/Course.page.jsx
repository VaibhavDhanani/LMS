import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllCourse } from "@/services/course.service";
import { Search, BookOpen } from 'lucide-react';
import { useSearchParams } from "react-router-dom"; // ✅ Import useSearchParams
import CourseCard from "@/components/General/CourseCard"; 

const CoursePage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const { user } = useAuth();
  const [searchParams] = useSearchParams(); // ✅ Get search query from URL
  const searchQuery = searchParams.get("q") || ""; // Get "q" parameter or empty string

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAllCourse();
        if (response.success) {
          setCourses(response.data);
        } else {
          setErrorMessage(response.message || "Failed to fetch courses.");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setErrorMessage("An error occurred while fetching courses.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...courses];

    // ✅ Apply search filter from URL
    if (searchQuery) {
      // console.log(courses);
      filtered = filtered.filter(course => 
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())||
        course.instructor.name?.toLowerCase().includes(searchQuery.toLowerCase())||
        course.instructor.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // ✅ Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // ✅ Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case "popular":
        filtered.sort((a, b) => (b.enrollments || 0) - (a.enrollments || 0));
        break;
      case "price-low":
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      default:
        break;
    }

    setFilteredCourses(filtered);
  }, [searchQuery, selectedCategory, sortBy, courses]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Welcome Section */}
      {user && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4">
            <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
            <p className="mt-2 text-blue-100">Continue your learning journey with our latest courses.</p>
          </div>
        </div>
      )}
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              {/* <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              /> */}
            </div>
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="development">Development</option>
                <option value="business">Business</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest</option>
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Course Listing */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="mt-4 text-gray-600">Loading courses...</p>
            </div>
          ) : errorMessage ? (
            <div className="text-center py-12">
              <p className="text-red-600">{errorMessage}</p>
            </div>
          ) : filteredCourses.length > 0 ? (
            <>
              <h2 className="text-2xl font-bold">
                {searchQuery ? `Search Results for "${searchQuery}"` : "Available Courses"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            </>
          ) : (
            <>
            <h2 className="text-2xl font-bold">
              {searchQuery ? `Search Results for "${searchQuery}"` : "Available Courses"}
            </h2>
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">Try adjusting your search or filters.</p>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
