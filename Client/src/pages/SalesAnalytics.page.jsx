import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Calendar, Filter, Download } from "lucide-react";
import { getInstructorCourse } from "@/services/course.service";
import { getOverallSalesData } from "@/services/transaction.service";
import { useAuth } from "@/context/AuthContext";

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#F06292', '#4DB6AC', '#7986CB', '#FFB74D'];

const SalesAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [salesData, setSalesData] = useState({
    monthlySales: [],
    totalRevenue: 0,
    totalEnrollments: 0,
    courseBreakdown: []
  });
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [view, setView] = useState('revenue'); // 'revenue' or 'enrollments'
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all courses
        const coursesRes = await getInstructorCourse(user.id, token,{ isActive: true });
        if (coursesRes.success) {
          setCourses(coursesRes.data || []);
        }

        // Fetch overall sales data
        const salesRes = await getOverallSalesData(user.id, token, {
          startDate: dateRange.startDate || undefined,
          endDate: dateRange.endDate || undefined
        });

        if (salesRes.success) {
          setSalesData({
            monthlySales: salesRes.data.monthlySales || [],
            totalRevenue: salesRes.data.totalRevenue || 0,
            totalEnrollments: salesRes.data.totalEnrollments || 0,
            courseBreakdown: salesRes.data.courseBreakdown || []
          });
        }
      } catch (error) {
        console.error("Error fetching sales analytics data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, dateRange]);

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const applyDateFilter = (e) => {
    e.preventDefault();
    // The useEffect will automatically refetch data when dateRange changes
  };

  const exportData = () => {
    // Create CSV data
    const header = "Month,Revenue,Enrollments\n";
    const rows = salesData.monthlySales.map(item =>
      `${item.month},${item.sales},${item.enrollments}`
    ).join("\n");

    const csvContent = `data:text/csv;charset=utf-8,${header}${rows}`;

    // Create download link and click it
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_data_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate percentage for each course
  const pieData = salesData.courseBreakdown.map((item, index) => ({
    name: item.title,
    value: item.revenue,
    percentage: ((item.revenue / salesData.totalRevenue) * 100).toFixed(2),
    color: COLORS[index % COLORS.length]
  }));

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <p className="text-xl">Loading sales analytics...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Sales Analytics</h1>
        <div className="space-x-4">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md flex items-center gap-2"
            onClick={exportData}
          >
            <Download size={18} />
            Export Data
          </button>
        </div>
      </header>

      {/* Date Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Filter size={18} />
          Filter Analytics
        </h2>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 mb-1">Total Revenue</h3>
          <p className="text-3xl font-bold">${salesData.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 mb-1">Total Enrollments</h3>
          <p className="text-3xl font-bold">{salesData.totalEnrollments.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 mb-1">Average Course Price</h3>
          <p className="text-3xl font-bold">
            ${salesData.totalEnrollments > 0
              ? (salesData.totalRevenue / salesData.totalEnrollments).toFixed(2)
              : '0.00'
            }
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-gray-500 mb-1">Currently Active Courses</h3>
          <p className="text-3xl font-bold">{courses.length}</p>
        </div>
      </div>

      {/* Toggle between Revenue and Enrollments */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Monthly Trends</h2>
          <div className="flex border rounded-md overflow-hidden">
            <button
              className={`px-4 py-2 ${view === 'revenue' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setView('revenue')}
            >
              Revenue
            </button>
            <button
              className={`px-4 py-2 ${view === 'enrollments' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
              onClick={() => setView('enrollments')}
            >
              Enrollments
            </button>
          </div>
        </div>

        {salesData.monthlySales.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData.monthlySales} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                {view === 'revenue' ? (
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#8884d8"
                    name="Revenue ($)"
                    activeDot={{ r: 8 }}
                  />
                ) : (
                  <Line
                    type="monotone"
                    dataKey="enrollments"
                    stroke="#82ca9d"
                    name="Enrollments"
                    activeDot={{ r: 8 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex justify-center items-center h-64 border rounded-lg bg-gray-50">
            <p className="text-gray-500">No sales data available for this period</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Course Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Course Revenue Breakdown</h2>
          {pieData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No course breakdown data available</p>
            </div>
          )}
        </div>

        {/* Bar Chart: Monthly Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Revenue</h2>
          {salesData.monthlySales.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData.monthlySales} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="sales" name="Revenue ($)" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64 border rounded-lg bg-gray-50">
              <p className="text-gray-500">No monthly revenue data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Course Performance Table */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Course Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-gray-700">Course</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700">Revenue</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700">Enrollments</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700">Avg. Price</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700">% of Total</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700">Status</th>
                <th className="py-3 px-4 text-right font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {salesData.courseBreakdown.map((course, index) => (

                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-left">{course.title}</td>
                  <td className="py-3 px-4 text-right">${course.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{course.enrollments}</td>
                  <td className="py-3 px-4 text-right">
                    ${course.enrollments > 0
                      ? (course.revenue / course.enrollments).toFixed(2)
                      : '0.00'
                    }
                  </td>
                  <td className="py-3 px-4 text-right">
                    {((course.revenue / salesData.totalRevenue) * 100).toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={course.isActive ? "text-green-600" : "text-red-600"}>
                      {course.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => navigate(`/courses-analytics/${course.courseId}`)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalyticsPage;