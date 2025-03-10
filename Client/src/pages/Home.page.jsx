import React from 'react';
import { BookOpen, Video, Users, CreditCard, Sparkles, ChevronRight, Github,ArrowRight, Twitter, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Course Creation",
      description: "Powerful tools for educators to create and manage courses"
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Live Lectures",
      description: "Interactive live sessions with real-time student engagement"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Student Enrollment",
      description: "Seamless enrollment process with progress tracking"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Secure Payments",
      description: "Safe and reliable payment processing for courses"
    }
  ];

  const trendingCourses = [
    {
      title: "Advanced Web Development",
      instructor: "Sarah Johnson",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600",
      price: "$89.99",
      rating: 4.8
    },
    {
      title: "Data Science Fundamentals",
      instructor: "Michael Chen",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600",
      price: "$79.99",
      rating: 4.7
    },
    {
      title: "Digital Marketing Mastery",
      instructor: "Emma Wilson",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600",
      price: "$69.99",
      rating: 4.9
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Create Something<br />Extraordinary
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Transform your ideas into reality with our cutting-edge platform. Build, test, and launch faster than ever before.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {!user &&(

            <button className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center"
            onClick={()=>{navigate("/auth");}}>
              Join Now <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            )}
            <button className="w-full sm:w-auto border border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-colors"
            onClick={()=>{navigate("/courses");}}>
              Explore Courses
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Learn Space?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides everything you need to learn and teach effectively
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="text-blue-600 mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Courses */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Trending Courses</h2>
            <button className="flex items-center text-blue-600 hover:text-blue-700"
            onClick={()=>{navigate("/courses");}}>
              View all courses <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingCourses.map((course, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">by {course.instructor}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-semibold">{course.price}</span>
                    <div className="flex items-center">
                      <Sparkles className="w-5 h-5 text-yellow-400 mr-1" />
                      <span className="text-gray-600">{course.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">What Our Users Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <blockquote className="bg-white p-8 rounded-xl shadow-sm">
              <p className="text-gray-600 mb-6">"Learn Space has transformed how I teach online. The platform's features make it easy to create engaging content and interact with students."</p>
              <footer className="flex items-center">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100" alt="Sarah M." className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <cite className="font-semibold text-gray-900 not-italic">Sarah M.</cite>
                  <p className="text-gray-600">Web Development Instructor</p>
                </div>
              </footer>
            </blockquote>
            <blockquote className="bg-white p-8 rounded-xl shadow-sm">
              <p className="text-gray-600 mb-6">"The quality of courses and the learning experience on Learn Space is unmatched. I've gained valuable skills that helped advance my career."</p>
              <footer className="flex items-center">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100" alt="John D." className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <cite className="font-semibold text-gray-900 not-italic">John D.</cite>
                  <p className="text-gray-600">Student</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>


    </div>
  );
}

export default HomePage;