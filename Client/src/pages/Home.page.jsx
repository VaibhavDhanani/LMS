import React, { useState, useEffect } from 'react';
import { BookOpen, Video, BarChart, CreditCard, Sparkles, ChevronRight, ArrowRight, MessageCircle, Bell, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getTrendingCourse } from '@/services/course.service';

function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trendingCourses, setTrendingCourses] = useState([]);

  useEffect(() => {
    const fetchTrendingCourses = async () => {
      try {
        const response = await getTrendingCourse();
        if (response.success) {
          setTrendingCourses(response.data.slice(0, 3)); // Get only the first three courses
        }
      } catch (error) {
        console.error("Error fetching trending courses:", error);
      }
    };
    fetchTrendingCourses();
  }, []);
  
  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Course Creation",
      description: "Simple tools for educators to create, publish and sell their expertise"
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "Live Lectures",
      description: "Host interactive live classes with real-time chat and engagement"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Secure Payments",
      description: "Integrated Stripe payment gateway for seamless transactions"
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Live Chat",
      description: "Real-time communication between instructors and students during live lectures"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Notifications",
      description: "Instant alerts for class schedules, payments, and interactions"
    },
    {
      icon: <BarChart className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Track course performance, student engagement and revenue metrics"
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl sm:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
            Teach, Learn, and<br />Earn Online
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            The complete learning management platform where educators can create, sell courses and host live classes while students learn from industry experts.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {!user && (
              <button 
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                onClick={() => { navigate("/auth"); }}
              >
                Start Teaching or Learning <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
            <button 
              className="w-full sm:w-auto border border-gray-300 text-gray-700 px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-50 transition-colors"
              onClick={() => { navigate("/courses"); }}
            >
              Browse Courses
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-gray-50 pt-[150px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need in One Platform</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              LearnSpace provides all the tools for educators to teach and earn while students gain valuable skills
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* How It Works Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How LearnSpace Works</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A seamless experience for both educators and learners
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-8">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">1</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Create and Upload</h3>
                    <p className="text-gray-600">Educators create courses with videos, documents, and interactive materials</p>
                  </div>
                </div>
              </div>
              <div className="mb-8">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">2</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Set Your Price</h3>
                    <p className="text-gray-600">Choose pricing that values your expertise with secure Stripe payments</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">3</div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Teach Live</h3>
                    <p className="text-gray-600">Host live video lectures with real-time chat and student interaction</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-100 p-8 rounded-xl">
              <h3 className="text-xl font-semibold mb-4">For Students</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-blue-600 mr-2 mt-1" />
                  <span>Browse and purchase courses from expert educators</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-blue-600 mr-2 mt-1" />
                  <span>Attend scheduled live lectures with interactive features</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-blue-600 mr-2 mt-1" />
                  <span>Engage with instructors through live chat during sessions</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-blue-600 mr-2 mt-1" />
                  <span>Receive real-time notifications for new content and events</span>
                </li>
                <li className="flex items-start">
                  <ChevronRight className="w-5 h-5 text-blue-600 mr-2 mt-1" />
                  <span>Track your learning progress across multiple courses</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Courses */}
      <div className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Trending Courses</h2>
            <button 
              className="flex items-center text-blue-600 hover:text-blue-700"
              onClick={() => { navigate("/courses"); }}
            >
              View all courses <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trendingCourses.map((course, index) => (
              <div key={index} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-300">
                <img src={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4">by {course.instructor.name}</p>
                  <div className="flex items-center mb-4">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500">
                      {course.liveSessions ? `${course.liveSessions} live sessions` : 'Self-paced'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-semibold">${course.price ? course.price : 'Free'}</span>
                    <button 
                      onClick={() => { navigate(`courses/${course._id}`) }}  
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                    >
                      Explore Course
                    </button>
                  </div>
                  <div className="flex items-center mt-4">
                    <Sparkles className="w-5 h-5 text-yellow-400 mr-1" />
                    <span className="text-gray-600">{course.rating ? course.rating : '4.8'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">What Our Users Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <blockquote className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-600 mb-6">"LearnSpace has transformed my teaching career. The live lecture feature with real-time chat allows me to connect with students globally, and the Stripe integration means I get paid quickly and securely."</p>
              <footer className="flex items-center">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100" alt="Sarah M." className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <cite className="font-semibold text-gray-900 not-italic">Sarah M.</cite>
                  <p className="text-gray-600">Web Development Instructor</p>
                </div>
              </footer>
            </blockquote>
            <blockquote className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-600 mb-6">"As a student, the notification system keeps me updated on upcoming live classes, and the chat feature lets me get immediate feedback from instructors. The payment process was smooth and secure."</p>
              <footer className="flex items-center">
                <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100" alt="John D." className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <cite className="font-semibold text-gray-900 not-italic">John D.</cite>
                  <p className="text-gray-600">Software Engineering Student</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {/* <div className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">Ready to Start Your Learning Journey?</h2>
          <p className="text-xl text-white opacity-90 mb-12 max-w-2xl mx-auto">
            Whether you want to teach and earn or learn and grow, LearnSpace has everything you need.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {!user && (
              <button 
                className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-colors"
                onClick={() => { navigate("/auth"); }}
              >
                Create Your Account
              </button>
            )}
            <button 
              className="w-full sm:w-auto border border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:bg-opacity-10 transition-colors"
              onClick={() => { navigate("/courses"); }}
            >
              Explore Courses
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default HomePage;