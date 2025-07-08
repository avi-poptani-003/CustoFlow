import { useState, useEffect } from "react"
import { useTheme } from "../context/ThemeContext"
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from "recharts"
import {
  Home,
  CalendarCheck,
  Percent,
  IndianRupee,
  Download,
  Filter,
  ChevronDown,
  Users,
  BarChart2,
  PieChartIcon,
  ArrowUpRight,
  Building,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react"
import Navbar from "../components/common/Navbar"
import propertyService from "../services/propertyService"
import leadService from "../services/leadService"

const formatIndianPrice = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

const COLORS = ["#4285F4", "#34A853", "#FBBC05", "#EA4335", "#8AB4F8", "#CEEAD6", "#FDE293", "#F6AEA9"]

function Analytics() {
  const { theme } = useTheme()
  const [timeRange, setTimeRange] = useState("month")
  const [filter, setFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState("All Locations")
  const [selectedPropertyType, setSelectedPropertyType] = useState("All Types")
  const [selectedPriceRange, setSelectedPriceRange] = useState("All Prices")

  // State for all fetched data
  const [kpiCards, setKpiCards] = useState([])
  const [salesData, setSalesData] = useState([])
  const [monthlyGrowthData, setMonthlyGrowthData] = useState([])
  const [propertyTypeData, setPropertyTypeData] = useState([])
  const [leadSourceData, setLeadSourceData] = useState([])
  const [recentProperties, setRecentProperties] = useState([])
  
  const [teamPerformanceData, setTeamPerformanceData] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true)
        // Fetch all data in parallel
        const [properties, leadStats, teamPerformance] = await Promise.all([
          propertyService.getProperties(),
          leadService.getDashboardStats("year"),
          leadService.getTeamPerformance(),
        ])
        
        // --- FIX START: Process Team Performance Data ---
        // This block processes the raw team performance data from the API
        // to calculate the conversion rate and map the profile image URL correctly.
        const processedTeamPerformance = teamPerformance.map(agent => {
          // Calculate conversion rate.
          // Assumes the API response for each agent includes 'deals' and 'total_leads'.
          // If 'total_leads' is named differently in your API response (e.g., 'leads_assigned'),
          // please update the field name below.
          const conversionRate = agent.total_leads > 0 
              ? (agent.deals / agent.total_leads) * 100 
              : 0;

          // Map the profile image URL.
          // Assumes the API response provides the agent's image URL in a field called 'profile_url'.
          // The component expects a field named 'avatar', so we are creating it here.
          // Note: If 'profile_url' is a relative path, you may need to prepend your API's base URL.
          return {
              ...agent,
              avatar: agent.profile_url, 
              conversionRate: parseFloat(conversionRate.toFixed(1)),
          };
        });
        setTeamPerformanceData(processedTeamPerformance) // <-- Set the processed data
        // --- FIX END ---


        // --- Process Property Data ---
        const typeCounts = properties.reduce((acc, property) => {
          const type = property.property_type || "Other"
          acc[type] = (acc[type] || 0) + 1
          return acc
        }, {})
        const totalProperties = properties.length
        const distributionData = Object.entries(typeCounts).map(([name, count]) => ({
          name,
          value: Math.round((count / totalProperties) * 100),
        }))
        setPropertyTypeData(distributionData)

        const sortedProperties = [...properties].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        setRecentProperties(sortedProperties.slice(0, 3))

        // --- Process Lead Statistics ---
        const {
          total_leads,
          converted_leads,
          conversion_rate,
          new_leads,
          current_month_total_leads,
          previous_month_total_leads,
          current_month_converted_leads,
          previous_month_converted_leads,
          source_distribution,
          daily_leads_added,
        } = leadStats

        // 1. KPI Cards
        let totalLeadsChange = 0
        if (previous_month_total_leads > 0) {
          totalLeadsChange = ((current_month_total_leads - previous_month_total_leads) / previous_month_total_leads) * 100
        } else if (current_month_total_leads > 0) {
          totalLeadsChange = 100
        }

        let convertedLeadsChange = 0
        if (previous_month_converted_leads > 0) {
          convertedLeadsChange =
            ((current_month_converted_leads - previous_month_converted_leads) / previous_month_converted_leads) * 100
        } else if (current_month_converted_leads > 0) {
          convertedLeadsChange = 100
        }

        setKpiCards([
          {
            title: "Total Leads",
            value: total_leads,
            change: `${totalLeadsChange.toFixed(1)}%`,
            icon: Users,
            trend: totalLeadsChange >= 0 ? "up" : "down",
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-100 dark:bg-blue-900/30",
          },
          {
            title: "Converted Deals",
            value: converted_leads,
            change: `${convertedLeadsChange.toFixed(1)}%`,
            icon: Home,
            trend: convertedLeadsChange >= 0 ? "up" : "down",
            color: "text-green-600 dark:text-green-400",
            bgColor: "bg-green-100 dark:bg-green-900/30",
          },
          {
            title: "New Leads (This Month)",
            value: new_leads,
            change: "", // No comparison data from API for this metric
            icon: CalendarCheck,
            trend: "up",
            color: "text-orange-600 dark:text-orange-400",
            bgColor: "bg-orange-100 dark:bg-orange-900/30",
          },
          {
            title: "Conversion Rate",
            value: `${conversion_rate}%`,
            change: "", // No comparison data from API for this metric
            icon: Percent,
            trend: "up",
            color: "text-purple-600 dark:text-purple-400",
            bgColor: "bg-purple-100 dark:bg-purple-900/30",
          },
        ])

        // 2. Lead Source Distribution
        const totalLeadsFromSource = source_distribution.reduce((acc, item) => acc + item.count, 0)
        const formattedLeadSourceData = source_distribution.map((item) => ({
          name: item.source,
          value: totalLeadsFromSource > 0 ? Math.round((item.count / totalLeadsFromSource) * 100) : 0,
        }))
        setLeadSourceData(formattedLeadSourceData)

        // 3. Leads Over Time (Sales) & Monthly Growth Charts
        const monthlyData = daily_leads_added.reduce((acc, item) => {
          const month = item.date.substring(0, 7) // e.g., 2023-MM
          if (!acc[month]) {
            acc[month] = { count: 0 }
          }
          acc[month].count += item.count
          return acc
        }, {})

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        const formattedSalesData = Object.keys(monthlyData).map((monthKey) => {
          const date = new Date(`${monthKey}-02`)
          return {
            month: monthNames[date.getMonth()],
            leads: monthlyData[monthKey].count,
          }
        })
        setSalesData(formattedSalesData)

        const sortedMonths = Object.keys(monthlyData).sort()
        const formattedGrowthData = []
        for (let i = 0; i < sortedMonths.length; i++) {
          const currentMonthKey = sortedMonths[i]
          const prevMonthKey = i > 0 ? sortedMonths[i - 1] : null
          const currentMonthCount = monthlyData[currentMonthKey].count
          const prevMonthCount = prevMonthKey ? monthlyData[prevMonthKey].count : 0
          let growth = 0
          if (prevMonthCount > 0) {
            growth = ((currentMonthCount - prevMonthCount) / prevMonthCount) * 100
          } else if (currentMonthCount > 0) {
            growth = 100
          }
          const date = new Date(`${currentMonthKey}-02`)
          formattedGrowthData.push({
            name: monthNames[date.getMonth()],
            growth: parseFloat(growth.toFixed(1)),
          })
        }
        setMonthlyGrowthData(formattedGrowthData.slice(-5)) // Get last 5 months of data


        setError(null)
      } catch (err) {
        console.error("Failed to fetch analytics data:", err)
        setError("Failed to load analytics data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])
  
  const handleReset = () => {
    setFilter("")
  }

  const isDark = theme === "dark"
  const secondaryText = isDark ? "text-gray-400" : "text-gray-500"

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} flex justify-center items-center`}>
        <p>Loading analytics dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} flex justify-center items-center`}>
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      <Navbar />
      <div className="container mx-auto px-4 py-6">
         {/* Header */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Analytics Dashboard</h1>
            <p className={secondaryText}>Comprehensive insights for your real estate business</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isDark ? "bg-gray-700 border-gray-600 hover:bg-gray-600" : "bg-white border-gray-300 hover:bg-gray-50"
              } border transition-colors`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div
            className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border mb-6`}
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <h3 className="text-lg font-bold">Filter Analytics</h3>
              <button
                onClick={() => {
                  setSelectedLocation("All Locations")
                  setSelectedPropertyType("All Types")
                  setSelectedPriceRange("All Prices")
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-1">Location</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                >
                  <option>All Locations</option>
                  <option>Mumbai</option>
                  <option>Delhi</option>
                  <option>Bangalore</option>
                  <option>Hyderabad</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Property Type</label>
                <select
                  value={selectedPropertyType}
                  onChange={(e) => setSelectedPropertyType(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                >
                  <option>All Types</option>
                  <option>Residential</option>
                  <option>Commercial</option>
                  <option>Land</option>
                </select>
              </div>

              <div>
                <label className="block text-sm mb-1">Price Range</label>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className={`w-full p-2 rounded-lg border ${
                    isDark ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300 text-gray-900"
                  }`}
                >
                  <option>All Prices</option>
                  <option>Under ₹50L</option>
                  <option>₹50L - ₹1Cr</option>
                  <option>₹1Cr - ₹2Cr</option>
                  <option>Above ₹2Cr</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {["Lead Analysis", "Team Performance", "Property Stats"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${
                    filter === item
                      ? "bg-blue-600 text-white"
                      : isDark
                        ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                  } border ${filter === item ? "border-blue-600" : isDark ? "border-gray-600" : "border-gray-300"}`}
              >
                {item}
              </button>
            ))}
          </div>
          {filter && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 transition"
            >
              Clear Filter
            </button>
          )}
        </div>

        {/* Lead Analysis */}
        {(!filter || filter === "Lead Analysis") && (
          <>
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-6">
              {/* KPI Cards */}
              {kpiCards.map((card) => (
                <div
                  key={card.title}
                  className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border transition-all hover:shadow-md hover:translate-y-[-2px] hover:border-blue-500 duration-300 md:col-span-3 lg:col-span-3 group`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={secondaryText}>{card.title}</p>
                      <h3 className="text-2xl font-bold mt-1 group-hover:text-blue-500 transition-colors duration-300">
                        {card.value}
                      </h3>
                      {card.change && (
                        <div
                          className={`flex items-center mt-1 ${card.trend === "up" ? "text-green-500" : "text-red-500"}`}
                        >
                          <ArrowUpRight className={`h-3 w-3 mr-1 ${card.trend === "down" ? "rotate-90" : ""}`} />
                          <span className="text-xs font-medium">{card.change}</span>
                        </div>
                      )}
                    </div>
                    <div
                      className={`${card.bgColor} p-3 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 ${isDark ? "group-hover:bg-blue-900/50" : ""}`}
                    >
                      <card.icon
                        className={`h-6 w-6 ${card.color} group-hover:text-blue-600 transition-colors duration-300`}
                      />
                    </div>
                  </div>
                </div>
              ))}

              {/* Leads Over Time Chart */}
              <div
                className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border md:col-span-4 lg:col-span-8 transition-all duration-300 hover:shadow-md hover:border-blue-500 group`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors duration-300">
                    Leads Over Time
                  </h3>
                  <div className="flex space-x-2">
                    {["week", "month", "quarter", "year"].map((range) => (
                      <button
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          timeRange === range
                            ? "bg-blue-600 text-white"
                            : isDark
                              ? "text-gray-400 hover:bg-blue-600/20 hover:text-blue-300"
                              : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                      >
                        {range.charAt(0).toUpperCase() + range.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4285F4" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#4285F4" stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f3f4f6"} vertical={false} />
                      <XAxis dataKey="month" stroke={isDark ? "#9CA3AF" : "#6B7280"} />
                      <YAxis stroke={isDark ? "#9CA3AF" : "#6B7280"} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                          border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                      />
                      <RechartsLegend />
                      <Area
                        type="monotone"
                        dataKey="leads"
                        stroke="#4285F4"
                        fillOpacity={1}
                        fill="url(#colorLeads)"
                        name="Leads Added"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Growth */}
              <div
                className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border md:col-span-2 lg:col-span-4 transition-all duration-300 hover:shadow-md hover:border-blue-500 group`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors duration-300">
                    Monthly Growth
                  </h3>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <BarChart2 className="h-4 w-4 mr-1" />
                    <span className="text-xs">Year-to-Date</span>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f3f4f6"} vertical={false} />
                      <XAxis dataKey="name" stroke={isDark ? "#9CA3AF" : "#6B7280"} />
                      <YAxis stroke={isDark ? "#9CA3AF" : "#6B7280"} tickFormatter={(value) => `${value}%`} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                          border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                          borderRadius: "8px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        }}
                        formatter={(value) => [`${value}%`, "Growth Rate"]}
                      />
                      <Bar dataKey="growth" fill="#4285F4" radius={[4, 4, 0, 0]}>
                        {monthlyGrowthData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Property Distribution */}
              <div
                className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border md:col-span-3 lg:col-span-5 transition-all duration-300 hover:shadow-md hover:border-blue-500 group`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors duration-300">
                    Property Distribution
                  </h3>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <PieChartIcon className="h-4 w-4 mr-1" />
                    <span className="text-xs">By Type</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={propertyTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {propertyTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                            border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                            borderRadius: "8px",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                          formatter={(value) => [`${value}%`, ""]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-col justify-center">
                    {propertyTypeData.map((item, index) => (
                      <div key={index} className="flex items-center mb-3 last:mb-0">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div className="flex justify-between w-full">
                          <span className="text-sm">{item.name}</span>
                          <span className="text-sm font-medium">{item.value}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Top Performers */}
              <div
                className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border md:col-span-3 lg:col-span-7 transition-all duration-300 hover:shadow-md hover:border-blue-500 group`}
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors duration-300">
                      Top Performers
                    </h3>
                  </div>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded flex items-center">
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {teamPerformanceData.slice(0, 3).map((agent, index) => (
                    <div key={agent.agent} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <img
                            src={agent.avatar || "/image.png"}
                            alt={agent.agent}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div
                            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"
                            }`}
                          >
                            {index + 1}
                          </div>
                        </div>
                        <div>
                          <p className="font-medium">{agent.agent}</p>
                          <p className={secondaryText}>{agent.deals} deals</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatIndianPrice(agent.revenue)}</p>
                        <div className={`w-24 h-1.5 ${isDark ? "bg-gray-600" : "bg-gray-200"} rounded-full mt-1`}>
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${agent.conversionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lead Sources */}
              <div
                className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border md:col-span-2 lg:col-span-4 transition-all duration-300 hover:shadow-md hover:border-blue-500 group`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors duration-300">
                    Lead Sources
                  </h3>
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <Users className="h-4 w-4 mr-1" />
                    <span className="text-xs">Distribution (%)</span>
                  </div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadSourceData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                      <XAxis type="number" domain={[0, 100]} />
                      <YAxis dataKey="name" type="category" width={100} />
                      <RechartsTooltip
                        formatter={(value) => [`${value}%`, "Percentage"]}
                        contentStyle={{
                          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                          border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {leadSourceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Properties */}
              <div
                className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border md:col-span-4 lg:col-span-8 transition-all duration-300 hover:shadow-md hover:border-blue-500 group`}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors duration-300">
                    Recent Properties
                  </h3>
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${isDark ? "border-gray-600" : "border-gray-300"}`}>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Performance
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? "divide-gray-600" : "divide-gray-300"}`}>
                      {recentProperties.map((property) => (
                        <tr
                          key={property.id}
                          className={`${isDark ? "hover:bg-blue-900/10" : "hover:bg-blue-50"} cursor-pointer transition-all duration-200 group border-l-4 border-transparent hover:border-blue-500`}
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium group-hover:text-blue-500 transition-colors duration-200">
                              {property.title}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <Building className="w-3 h-3 mr-1" />
                              <span>{property.property_type}</span>
                              <span className="mx-1">•</span>
                              <MapPin className="w-3 h-3 mr-1" />
                              <span className="truncate max-w-[150px]">{property.address}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium">{formatIndianPrice(property.price)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                property.status === "Available"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              }`}
                            >
                              {property.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-sm">{property.views || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                <span className="text-sm">{property.inquiries || 0}</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Team Performance */}
        {filter === "Team Performance" && (
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
            <div
              className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border md:col-span-6 lg:col-span-12`}
            >
              <h2 className="text-lg font-bold mb-6">Team Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? "border-gray-600" : "border-gray-300"}`}>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Deals
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Conversion Rate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Performance
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-gray-600" : "divide-gray-300"}`}>
                    {teamPerformanceData.map((agent, index) => (
                      <tr
                        key={agent.agent}
                        className={`${isDark ? "hover:bg-blue-900/10" : "hover:bg-blue-50"} cursor-pointer transition-all duration-200 group border-l-4 border-transparent hover:border-blue-500`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={agent.avatar || "/image.png"}
                              alt={agent.agent}
                              className="w-10 h-10 rounded-full mr-3 object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                            <div>
                              <div className="font-medium group-hover:text-blue-500 transition-colors duration-200">
                                {agent.agent}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Agent
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{agent.deals}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{formatIndianPrice(agent.revenue)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium">{agent.conversionRate}%</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`w-full h-1.5 ${isDark ? "bg-gray-600" : "bg-gray-200"} rounded-full`}>
                            <div
                              className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out group-hover:h-2.5 group-hover:shadow-md group-hover:shadow-blue-500/30"
                              style={{ width: `${agent.conversionRate}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Property Stats */}
        {filter === "Property Stats" && (
          <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6">
            <div
              className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border md:col-span-3 lg:col-span-6`}
            >
              <h2 className="text-lg font-bold mb-6">Property Type Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={propertyTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {propertyTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                        border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div
              className={`${isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-white border-gray-300 text-gray-900"} rounded-xl shadow-sm p-6 border md:col-span-3 lg:col-span-6`}
            >
              <h2 className="text-lg font-bold mb-6">Lead Source Distribution</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadSourceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#f3f4f6"} />
                    <XAxis dataKey="name" stroke={isDark ? "#9CA3AF" : "#6B7280"} />
                    <YAxis stroke={isDark ? "#9CA3AF" : "#6B7280"} tickFormatter={(value) => `${value}%`} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                        border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                      formatter={(value) => [`${value}%`, "Percentage"]}
                    />
                    <Bar dataKey="value" fill="#4285F4" radius={[4, 4, 0, 0]}>
                      {leadSourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Analytics