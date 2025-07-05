import { useState, useEffect, useMemo } from "react"
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
import { Calendar, Filter, Download } from "lucide-react"

const CourseAnalyticsPage = () => {
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [totalSales, setTotalSales] = useState(0)
  const [totalEnrollments, setTotalEnrollments] = useState(0)
  const { id: courseId } = useParams()
  const { token } = useAuth()
  const navigate = useNavigate()
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const currentYear = new Date().getFullYear();
  const startYear = course?.createdAt ? new Date(course.createdAt).getFullYear() : currentYear;

  const yearOptions = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i
  );

  const { totalDuration, totalLectures } = useMemo(() => {
    if (!course || !course.curriculum || course.curriculum.length === 0) {
      return { totalDuration: "0 minutes", totalLectures: 0 };
    }

    // Extract and flatten all lectures from sections
    const lectures = course.curriculum.flatMap(section => section.lectures || []);

    // Convert all durations to total seconds
    const totalSeconds = lectures.reduce((sum, lecture) => {
      const totalSecs = Math.round((lecture.duration || 0) * 60);
      return sum + totalSecs;
    }, 0);

    // Convert total seconds to hours, minutes, seconds
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Format the output
    let formattedDuration = `${minutes}m ${seconds}s`;
    if (hours > 0) {
      formattedDuration = `${hours}h ${minutes}m`;
    }

    return {
      totalDuration: formattedDuration,
      totalLectures: lectures.length, // Count total lectures
    };
  }, [course]);


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
          year: selectedYear
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
  }, [courseId, token, selectedYear])

  const handleYearChange = (e) => {
    setSelectedYear(Number(e.target.value));
  };
  const exportData = () => {
    // Create CSV data
    const header = "Month,Revenue,Enrollments\n";
    console.log(transactions);
    const rows = transactions.map(item =>
      `${item.month},${item.sales},${item.enrollments}`
    ).join("\n");

    const csvContent = `data:text/csv;charset=utf-8,${header}${rows}`;

    // Create download link and click it
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${course.title}_sales_data_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <header className="mb-8 flex flex-wrap justify-between items-center gap-4 mt-14">
        <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            onClick={() => navigate(`/courseform/${courseId}`)}
          >
            Edit Course
          </button>

          <button
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 transition"
            onClick={() => navigate(`/courses/${courseId}`)}
          >
            View Public Page
          </button>

          <button
            className="px-4 py-2 border border-gray-300 rounded-md flex items-center gap-2 hover:bg-gray-100 transition"
            onClick={exportData}
          >
            <Download size={18} /> Export Data
          </button>
        </div>
      </header>


      <div className="flex flex-wrap items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Filter size={20} /> Filter Analytics
        </h2>

        <div className="relative flex items-center gap-2 bg-gray-100 p-2 rounded-md">
          <label className="text-sm font-medium text-gray-600">Select Year:</label>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            className="border rounded-md px-2 py-1 bg-white text-sm focus:ring-2 focus:ring-blue-400"
          >
            {yearOptions.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <Calendar className="text-gray-500 w-5 h-5" />
        </div>
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
                  <span className="font-medium">Duration:</span>
                  {totalDuration}
                </div>
                <div><span className="font-medium">Language:</span> {course.details?.language}</div>
                <div><span className="font-medium">Technologies:</span> {course.technologies?.join(", ")}</div>
              </div>
              <div className="mb-4">
                <span className="text-2xl font-bold text-gray-900">₹{currentPrice?.toFixed(2) || 0}</span>
                {course.pricing?.discountEnabled && (
                  <>
                    <span className="text-lg text-gray-500 line-through ml-2">₹{course.pricing.price?.toFixed(2) || 0}</span>
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
              <p className="text-2xl font-bold">₹{totalSales.toLocaleString()}</p>
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
              ₹{totalEnrollments > 0 ? (totalSales / totalEnrollments).toFixed(2) : '0.00'}
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
                    name="Revenue (₹)"
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
                  <Bar dataKey="sales" name="Revenue (₹)" fill="#8884d8" />
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
                {totalLectures}
              </p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <h3 className="text-gray-500 mb-1">Total Duration</h3>
              <p className="text-2xl font-bold">
                {totalDuration}
              </p>
            </div>
            <div className="border rounded-lg p-4 text-center">
              <h3 className="text-gray-500 mb-1">Published at</h3>
              <p className="text-2xl font-bold">
                {course?.createdAt
                  ? new Date(course.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                  : "N/A"}
              </p>
            </div>

          </div>



        </div>
      </div>
    </div>
  )
}

export default CourseAnalyticsPage