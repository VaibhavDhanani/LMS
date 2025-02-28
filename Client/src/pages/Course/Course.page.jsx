import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { getCourseById } from "@/services/course.service"
import { getCourseTransactions } from "@/services/transaction.service"
import { useAuth } from "@/context/AuthContext"
import { Calendar } from "lucide-react"

const CourseAnalyticsPage = () => {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [totalSales, setTotalSales] = useState(0)
  const [totalEnrollments, setTotalEnrollments] = useState(0)
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const { id: courseId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch course data
        const courseRes = await getCourseById(courseId, token)
        if (courseRes.success) {
          setCourse(courseRes.data)
        }
        
        // Fetch transaction data
        const transactionRes = await getCourseTransactions(courseId, token, {
          startDate: dateRange.startDate || undefined,
          endDate: dateRange.endDate || undefined
        })
        if (transactionRes.success) {
          setTransactions(transactionRes.data.monthlySales || [])
          setTotalSales(transactionRes.data.totalRevenue || 0)
          setTotalEnrollments(transactionRes.data.totalEnrollments || 0)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [courseId, token, dateRange])

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    })
  }

  const applyDateFilter = (e) => {
    e.preventDefault()
    // The useEffect will automatically refetch data when dateRange changes
  }

  // Calculate current price with discount
  const currentPrice = course?.pricing?.discountEnabled
    ? course.pricing.price - (course.pricing.price * course.pricing.discount) / 100
    : course?.pricing?.price

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading course analytics...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <p className="text-xl text-red-500">Course not found</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
        <div className="space-x-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md" onClick={() => navigate(`/courseform/${courseId}`)}>Edit Course</button>
          <button className="px-4 py-2 border border-gray-300 rounded-md" onClick={() => navigate(`/courses/${courseId}`)}>View Public Page</button>
        </div>
      </header>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Filter Analytics</h2>
        <form onSubmit={applyDateFilter} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="border rounded-md p-2 pr-10"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="border rounded-md p-2 pr-10"
              />
              <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Apply Filter
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Overview Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Course Overview</h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <img 
                src={course.thumbnail || "/api/placeholder/200/150"} 
                alt={course.title} 
                className="rounded-md w-48 h-32 object-cover"
                onError={(e) => {
                  e.target.src = "/api/placeholder/200/150";
                }}
              />
            </div>
            <div className="flex-grow">
              <p className="text-gray-600 mb-4">{course.subtitle}</p>
              <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                <div><span className="font-medium">Level:</span> {course.details?.level}</div>
                <div>
                  <span className="font-medium">Duration:</span> {Math.floor((course.details?.totalMinutes || 0) / 60)}h{" "}
                  {(course.details?.totalMinutes || 0) % 60}m
                </div>
                <div><span className="font-medium">Language:</span> {course.details?.language}</div>
                <div><span className="font-medium">Technologies:</span> {course.technologies?.join(", ")}</div>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">${currentPrice?.toFixed(2) || 0}</span>
                {course.pricing?.discountEnabled && (
                  <>
                    <span className="text-lg text-gray-500 line-through ml-2">${course.pricing.price?.toFixed(2) || 0}</span>
                    <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">
                      {course.pricing.discount}% OFF
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center">
                <span className="text-yellow-400 text-lg">
                  {"★".repeat(Math.floor(course.rating || 0))}
                  {"☆".repeat(5 - Math.floor(course.rating || 0))}
                </span>
                <span className="ml-2 font-medium">{(course.rating || 0).toFixed(1)}</span>
                <span className="ml-2 text-gray-500">({course.reviews?.length || 0} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Summary Cards */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Sales Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h3 className="text-gray-500 mb-1">Total Revenue</h3>
              <p className="text-2xl font-bold">${totalSales.toLocaleString()}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-gray-500 mb-1">Total Enrollments</h3>
              <p className="text-2xl font-bold">{totalEnrollments}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-gray-500 mb-1">Avg. Rating</h3>
              <p className="text-2xl font-bold">{(course.rating || 0).toFixed(1)}</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="text-gray-500 mb-1">Avg. Sale Value</h3>
              <p className="text-2xl font-bold">
                ${totalEnrollments > 0 ? (totalSales / totalEnrollments).toFixed(2) : '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Revenue & Enrollments</h2>
          {transactions.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transactions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Revenue ($)"
                  />
                  <Line yAxisId="right" type="monotone" dataKey="enrollments" stroke="#82ca9d" name="Enrollments" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No transaction data available for this period</p>
            </div>
          )}
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Breakdown</h2>
          {transactions.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={transactions} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sales" name="Revenue ($)" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No transaction data available for this period</p>
            </div>
          )}
        </div>

        {/* Course Content Stats */}
        <div className="bg-white rounded-lg shadow p-6 col-span-1 lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Course Content</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="border rounded-lg p-4 text-center">
              <h3 className="text-gray-500 mb-1">Total Sections</h3>
              <p className="text-2xl font-bold">{course.curriculum?.length || 0}</p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <h3 className="text-gray-500 mb-1">Total Lectures</h3>
              <p className="text-2xl font-bold">
                {course.curriculum?.reduce((total, section) => total + (section.lectures?.length || 0), 0) || 0}
              </p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <h3 className="text-gray-500 mb-1">Total Duration</h3>
              <p className="text-2xl font-bold">
                {Math.floor((course.details?.totalMinutes || 0) / 60)}h {(course.details?.totalMinutes || 0) % 60}m
              </p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <h3 className="text-gray-500 mb-1">Completion Rate</h3>
              <p className="text-2xl font-bold">
                {course.completionStats?.averagePercentage?.toFixed(0) || 0}%
              </p>
            </div>
          </div>
          
          {/* This would ideally come from actual data about lecture views
          <h3 className="text-lg font-medium mb-3">Most Watched Lectures</h3>
          <div className="border rounded-lg divide-y">
            {course.topLectures ? (
              course.topLectures.map((lecture, index) => (
                <div key={index} className="p-4 flex justify-between items-center">
                  <span className="font-medium">{lecture.title}</span>
                  <span className="text-gray-500">{lecture.views} views</span>
                </div>
              ))
            ) : (
              <>
                <div className="p-4 flex justify-between items-center">
                  <span className="font-medium">Lecture view data not available yet</span>
                  <span className="text-gray-500">-</span>
                </div>
              </>
            )}
          </div> */}
        </div>
      </div>
    </div>
  )
}

export default CourseAnalyticsPage