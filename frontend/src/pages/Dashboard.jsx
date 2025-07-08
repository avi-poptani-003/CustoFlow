import { useState, useMemo, useEffect, useCallback } from "react";
import siteVisitService from "../services/siteVisitService";
import UserService from "../services/UserService";
import { useTheme } from "../context/ThemeContext";
import { useLeadStats } from "../hooks/useLeadStats";
import { useProperties } from "../hooks/useProperties";
import { useRevenue } from "../hooks/useRevenue";
import leadService from "../services/leadService"; // 
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  Building,
  Calendar,
  CheckCircle,
  ArrowUpRight,
  ChevronRight,
  PieChartIcon,
  Download,
  RefreshCw,
  AlertCircle,
  Clipboard,
} from "lucide-react";
import Navbar from "../components/common/Navbar";

// Helper function to calculate percentage change
const calculatePercentageChange = (current, previous) => {
  if (previous === 0) {
    return current > 0 ? "+100%" : "0.0%";
  }
  const change = ((current - previous) / previous) * 100;
  return `${change > 0 ? "+" : ""}${change.toFixed(1)}%`;
};

const formatVisitDate = (dateString) => {
  const visitDate = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  visitDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  if (visitDate.getTime() === today.getTime()) return "Today";
  if (visitDate.getTime() === tomorrow.getTime()) return "Tomorrow";
  return visitDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const COLORS = [
  "#4285F4",
  "#34A853",
  "#FBBC05",
  "#EA4335",
  "#8AB4F8",
  "#CEEAD6",
  "#FDE293",
  "#F6AEA9",
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString();
};

const LoadingSpinner = ({ isDark }) => (
  <div className="flex items-center justify-center p-8">
    <RefreshCw
      className={`h-8 w-8 animate-spin ${
        isDark ? "text-gray-400" : "text-gray-600"
      }`}
    />
    <span className={`ml-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
      Loading...
    </span>
  </div>
);

const ErrorMessage = ({ error, onRetry, isDark }) => (
  <div
    className={`flex items-center justify-center p-8 ${
      isDark ? "text-red-400" : "text-red-600"
    }`}
  >
    <AlertCircle className="h-6 w-6 mr-2" />
    <span className="mr-4">{error || "Failed to load data."}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className={`px-3 py-1 rounded text-sm ${
          isDark
            ? "bg-red-900/30 hover:bg-red-900/50 text-red-300"
            : "bg-red-100 hover:bg-red-200 text-red-700"
        }`}
      >
        Retry
      </button>
    )}
  </div>
);

const KPICard = ({ title, value, change, icon: Icon, color, isDark }) => {
  const isPositive = !change.includes("-");
  const bgColor = isDark ? `bg-${color}-900/30` : `bg-${color}-100`;
  const iconColor = isDark ? `text-${color}-400` : `text-${color}-600`;
  const changeColor = isPositive ? "text-green-500" : "text-red-500";
  return (
    <div
      className={`${
        isDark ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
      } rounded-xl shadow-sm p-6 border transition-all hover:shadow-md hover:translate-y-[-2px] duration-300 hover:border-blue-400 group`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={isDark ? "text-gray-300" : "text-gray-500"}>{title}</p>
          <h3
            className={`text-2xl font-bold mt-1 ${
              isDark ? "text-gray-100" : "text-gray-900"
            } group-hover:text-blue-600 transition-colors duration-300`}
          >
            {value}
          </h3>
          <div className={`flex items-center mt-1 ${changeColor}`}>
            <ArrowUpRight
              className={`h-3 w-3 mr-1 ${!isPositive ? "rotate-90" : ""}`}
            />
            <span className="text-xs font-medium">{change}</span>
          </div>
        </div>
        {Icon && (
          <div
            className={`${bgColor} p-3 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 ${
              isDark ? "group-hover:bg-blue-900/50" : ""
            }`}
          >
            <Icon
              className={`h-6 w-6 ${iconColor} group-hover:text-blue-600 transition-colors duration-300`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const StatusBadge = ({ status, isDark }) => {
  const getStatusStyles = () => {
    if (!status)
      return isDark ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-700";
    if (status.toLowerCase() === "new" || status.toLowerCase() === "confirmed")
      return isDark
        ? "bg-green-900/30 text-green-300"
        : "bg-green-100 text-green-800";
    if (
      status.toLowerCase() === "contacted" ||
      status.toLowerCase() === "scheduled"
    )
      return isDark
        ? "bg-yellow-900/30 text-yellow-300"
        : "bg-yellow-100 text-yellow-800";
    return isDark
      ? "bg-blue-900/30 text-blue-300"
      : "bg-blue-100 text-blue-800";
  };
  return (
    <span className={`px-2 py-1 text-xs rounded-full ${getStatusStyles()}`}>
      {status}
    </span>
  );
};

const SourceBadge = ({ source, isDark }) => (
  <span
    className={`px-2 py-1 text-xs rounded-full ${
      isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"
    }`}
  >
    {source}
  </span>
);

const ChartContainer = ({
  title,
  children,
  action,
  isDark,
  className = "",
}) => (
  <div
    className={`${
      isDark
        ? "bg-gray-700 border-gray-600 text-gray-100"
        : "bg-white border-gray-300 text-gray-900"
    } rounded-xl shadow-sm p-6 border transition-all hover:shadow-md hover:border-blue-500 duration-300 ${className} group`}
  >
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors duration-300">
        {title}
      </h3>
      {action}
    </div>
    {children}
  </div>
);

const ExportOptionsModal = ({
  isOpen,
  onClose,
  onDownloadCsv,
  onCopyCsv,
  isDark,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className={`rounded-lg shadow-xl p-6 w-full max-w-md ${
          isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <h3 className="text-xl font-bold mb-4">Export Dashboard Report</h3>
        <p className={`${isDark ? "text-gray-300" : "text-gray-600"} mb-6`}>
          Choose how you'd like to export your dashboard data.
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() => {
              onDownloadCsv();
              onClose();
            }}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md"
          >
            <Download className="w-5 h-5" /> Download as CSV
          </button>
          <button
            onClick={() => {
              onCopyCsv();
              onClose();
            }}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 shadow-md ${
              isDark
                ? "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
            }`}
          >
            <Clipboard className="w-5 h-5" /> Copy CSV for Google Sheets
          </button>
        </div>
        <button
          onClick={onClose}
          className={`mt-6 w-full px-4 py-2 rounded-lg transition-all duration-200 ${
            isDark
              ? "text-gray-400 hover:text-gray-300"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

// New component for the filter buttons
const TimeRangeFilter = ({ selected, onSelect, isDark }) => {
  const ranges = [
    { key: "this_month", label: "This Month" },
    { key: "3_months", label: "3M" },
    { key: "6_months", label: "6M" },
    { key: "year", label: "1Y" },
  ];

  return (
    <div className={`flex items-center gap-1 p-1 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
      {ranges.map(range => {
        const isActive = selected === range.key;
        return (
          <button
            key={range.key}
            onClick={() => onSelect(range.key)}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors duration-200 ${
              isActive
                ? "bg-blue-600 text-white shadow"
                : isDark
                ? "text-gray-400 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-300"
            }`}
          >
            {range.label}
          </button>
        );
      })}
    </div>
  );
};


const Dashboard = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [timeRange, setTimeRange] = useState("week");

  const {
    data: properties = [],
    isLoading: propertyLoading,
    error: propertyError,
    refetch: refetchProperties,
  } = useProperties();

  const [revenueTimeRange, setRevenueTimeRange] = useState("year");
  const {
    data: revenueData = [],
    isLoading: revenueLoading,
    error: revenueError,
    refetch: refetchRevenue,
  } = useRevenue(revenueTimeRange);

  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const [visitsError, setVisitsError] = useState(null);

  const [teamUsers, setTeamUsers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [teamError, setTeamError] = useState(null);
  
  const [builderPerformance, setBuilderPerformance] = useState([]);
  const [builderLoading, setBuilderLoading] = useState(true);
  const [builderError, setBuilderError] = useState(null);

  const [showExportModal, setShowExportModal] = useState(false);
  const [animateLeadPipeline, setAnimateLeadPipeline] = useState(false);
  const [animatePropertyTypes, setAnimatePropertyTypes] = useState(false);
  const [animateLeadSources, setAnimateLeadSources] = useState(false);

  const {
    stats,
    loading: leadStatsLoading,
    error: leadStatsError,
    refetch: refetchLeadStats,
  } = useLeadStats(timeRange);

  const fetchUpcomingVisits = useCallback(async () => {
    try {
      setVisitsLoading(true);
      const data = await siteVisitService.getUpcomingSiteVisits();
      setUpcomingVisits(data);
      setVisitsError(null);
    } catch (err) {
      setVisitsError("Failed to load upcoming visits.");
      setUpcomingVisits([]);
    } finally {
      setVisitsLoading(false);
    }
  }, []);

  const fetchTeamUsers = useCallback(async () => {
    try {
      setTeamLoading(true);
      const users = await UserService.getUsers();
      const teamStatusUsers = users.filter(
        (user) => user.role === "manager" || user.role === "agent"
      );
      setTeamUsers(teamStatusUsers);
      setTeamError(null);
    } catch (err) {
      setTeamError("Failed to load team members.");
      setTeamUsers([]);
      console.error("Error fetching team users:", err);
    } finally {
      setTeamLoading(false);
    }
  }, []);

  const fetchBuilderPerformance = useCallback(async () => {
    try {
      setBuilderLoading(true);
      const data = await leadService.getBuilderPerformance();
      const performanceWithColors = data.map(item => ({
        ...item,
        color: item.rate > 30 ? "bg-blue-600" : item.rate > 20 ? "bg-blue-500" : "bg-blue-400",
      }));
      setBuilderPerformance(performanceWithColors);
      setBuilderError(null);
    } catch (err) {
      setBuilderError("Failed to load builder performance.");
      console.error(err);
    } finally {
      setBuilderLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingVisits();
    fetchTeamUsers();
    fetchBuilderPerformance();
  }, [fetchUpcomingVisits, fetchTeamUsers, fetchBuilderPerformance]);

  useEffect(() => {
    refetchLeadStats(timeRange);
  }, [timeRange, refetchLeadStats]);

  useEffect(() => {
    if (!leadStatsLoading && stats?.status_distribution?.length > 0) {
      const timer = setTimeout(() => setAnimateLeadPipeline(true), 100);
      return () => clearTimeout(timer);
    } else if (leadStatsLoading) setAnimateLeadPipeline(false);
  }, [leadStatsLoading, stats]);

  const leadPipelineData = useMemo(
    () =>
      stats?.status_distribution?.map((item) => ({
        name: item.status,
        value: item.count,
      })) || [],
    [stats]
  );
  const leadSourceData = useMemo(
    () =>
      stats?.source_distribution?.map((item) => ({
        name: item.source,
        value: item.count,
      })) || [],
    [stats]
  );

  const propertyTypeData = useMemo(() => {
    if (!properties || properties.length === 0) return [];
    const counts = properties.reduce((acc, property) => {
      const type =
        property.property_type.charAt(0).toUpperCase() +
        property.property_type.slice(1);
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    const total = properties.length;
    return Object.entries(counts).map(([name, count]) => ({
      name,
      value: parseFloat(((count / total) * 100).toFixed(2)),
      count,
    }));
  }, [properties]);

  useEffect(() => {
    if (!propertyLoading && propertyTypeData.length > 0) {
      const timer = setTimeout(() => setAnimatePropertyTypes(true), 100);
      return () => clearTimeout(timer);
    } else if (propertyLoading) setAnimatePropertyTypes(false);
  }, [propertyLoading, propertyTypeData]);

  useEffect(() => {
    if (!leadStatsLoading && leadSourceData.length > 0) {
      const timer = setTimeout(() => setAnimateLeadSources(true), 100);
      return () => clearTimeout(timer);
    } else if (leadStatsLoading) setAnimateLeadSources(false);
  }, [leadStatsLoading, leadSourceData]);

  const handleRefreshData = useCallback(() => {
    setAnimateLeadPipeline(false);
    setAnimatePropertyTypes(false);
    setAnimateLeadSources(false);
    refetchLeadStats(timeRange);
    refetchProperties();
    refetchRevenue();
    fetchUpcomingVisits();
    fetchTeamUsers();
    fetchBuilderPerformance();
  }, [
    refetchLeadStats,
    timeRange,
    refetchProperties,
    refetchRevenue,
    fetchUpcomingVisits,
    fetchTeamUsers,
    fetchBuilderPerformance
  ]);

  const chartConfig = useMemo(
    () => ({
      contentStyle: {
        backgroundColor: isDark ? "#374151" : "#FFFFFF",
        border: `1px solid ${isDark ? "#4B5563" : "#E5E7EB"}`,
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        color: isDark ? "#F3F4F6" : "#1F2937",
      },
      gridStroke: isDark ? "#4B5563" : "#f3f4f6",
      axisStroke: isDark ? "#9CA3AF" : "#6B7280",
      backgroundColor: isDark ? "#374151" : "#FFFFFF",
    }),
    [isDark]
  );

  const formatXAxisDate = (tickItem) =>
    new Date(tickItem).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  const generateCsvContent = () => {
    return "";
  };
  const handleDownloadCsv = () => {};
  const handleCopyCsv = () => {};

  const isOverallPageLoading =
    leadStatsLoading || propertyLoading || visitsLoading || teamLoading || builderLoading;

  const totalLeadsChange = stats
    ? calculatePercentageChange(
        stats.current_month_total_leads,
        stats.previous_month_total_leads
      )
    : "0.0%";
  const convertedLeadsChange = stats
    ? calculatePercentageChange(
        stats.current_month_converted_leads,
        stats.previous_month_converted_leads
      )
    : "0.0%";
  const newLeadsChange = stats
    ? calculatePercentageChange(
        stats.current_month_new_leads,
        stats.previous_month_new_leads
      )
    : "0.0%";
  const qualifiedLeadsChange = stats
    ? calculatePercentageChange(
        stats.current_month_qualified_leads,
        stats.previous_month_qualified_leads
      )
    : "0.0%";

  if (
    isOverallPageLoading &&
    !animateLeadPipeline &&
    !animatePropertyTypes &&
    !animateLeadSources &&
    teamUsers.length === 0 &&
    properties.length === 0 &&
    upcomingVisits.length === 0 &&
    !stats
  ) {
    return (
      <div
        className={`min-h-screen ${
          isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
        }`}
      >
        <Navbar /> <LoadingSpinner isDark={isDark} />
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Welcome back, Admin
            </h1>
            <p className={isDark ? "text-gray-300" : "text-gray-600"}>
              Dashboard Overview
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefreshData}
              disabled={isOverallPageLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                isDark
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
              } ${isOverallPageLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isOverallPageLoading ? "animate-spin" : ""
                }`}
              />{" "}
              Refresh
            </button>
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-500/20"
            >
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {leadStatsError && !leadStatsLoading && (
          <ErrorMessage
            error={leadStatsError}
            onRetry={() => refetchLeadStats(timeRange)}
            isDark={isDark}
          />
        )}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KPICard
            title="Total Leads"
            value={stats?.total_leads?.toString() || "0"}
            change={totalLeadsChange}
            icon={Users}
            color="blue"
            isDark={isDark}
          />
          <KPICard
            title="Conversions"
            value={stats?.converted_leads?.toString() || "0"}
            change={convertedLeadsChange}
            icon={CheckCircle}
            color="green"
            isDark={isDark}
          />
          <KPICard
            title="New Leads"
            value={stats?.new_leads?.toString() || "0"}
            change={newLeadsChange}
            icon={Calendar}
            color="orange"
            isDark={isDark}
          />
          <KPICard
            title="Qualified Leads"
            value={stats?.qualified_leads?.toString() || "0"}
            change={qualifiedLeadsChange}
            icon={Building}
            color="purple"
            isDark={isDark}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
          <ChartContainer
            className="lg:col-span-3"
            title="Revenue Overview"
            isDark={isDark}
            action={
              <TimeRangeFilter
                selected={revenueTimeRange}
                onSelect={setRevenueTimeRange}
                isDark={isDark}
              />
            }
          >
            {revenueLoading ? (
              <LoadingSpinner isDark={isDark} />
            ) : revenueError ? (
              <ErrorMessage error={revenueError} onRetry={refetchRevenue} isDark={isDark} />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="5%" stopColor="#4285F4" stopOpacity={0.8} />
                        <stop
                          offset="95%"
                          stopColor="#4285F4"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34A853" stopOpacity={0.8} />
                        <stop
                          offset="95%"
                          stopColor="#34A853"
                          stopOpacity={0.1}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartConfig.gridStroke}
                      vertical={false}
                    />
                    <XAxis dataKey="name" stroke={chartConfig.axisStroke} />
                    <YAxis
                      stroke={chartConfig.axisStroke}
                      tickFormatter={formatCurrency}
                    />
                    <RechartsTooltip
                      contentStyle={chartConfig.contentStyle}
                      formatter={(value) => [formatCurrency(value), ""]}
                    />
                    <RechartsLegend />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4285F4"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue"
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#34A853"
                      fillOpacity={1}
                      fill="url(#colorSales)"
                      name="Sales"
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartContainer>
          
          <ChartContainer
            className="lg:col-span-3"
            title="Lead Pipeline"
            isDark={isDark}
            action={
              <button
                className={`${
                  isDark
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-500"
                } text-sm font-medium flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded`}
              >
                All Leads
              </button>
            }
          >
            {leadStatsLoading && !animateLeadPipeline ? (
              <LoadingSpinner isDark={isDark} />
            ) : leadStatsError ? (
              <ErrorMessage
                error={leadStatsError}
                onRetry={() => refetchLeadStats(timeRange)}
                isDark={isDark}
              />
            ) : leadPipelineData.length > 0 ? (
              <>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={leadPipelineData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        isAnimationActive={animateLeadPipeline}
                        animationDuration={800}
                        animationEasing="ease-out"
                      >
                        {leadPipelineData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={chartConfig.contentStyle}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {leadPipelineData.map((item, index) => (
                    <div key={index} className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <div
                          className="w-3 h-3 rounded-full mr-1"
                          style={{
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                        <span className="text-xs font-medium">{item.name}</span>
                      </div>
                      <p className="text-lg font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div
                className={`text-center p-8 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No lead pipeline data available.
              </div>
            )}
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <ChartContainer
            title="Daily Leads Added (Last 7 Days)"
            isDark={isDark}
          >
            {leadStatsLoading ? (
              <LoadingSpinner isDark={isDark} />
            ) : leadStatsError ? (
              <ErrorMessage
                error={leadStatsError}
                onRetry={() => refetchLeadStats(timeRange)}
                isDark={isDark}
              />
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.daily_leads_added || []}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={chartConfig.gridStroke}
                    />
                    <XAxis
                      dataKey="date"
                      stroke={chartConfig.axisStroke}
                      tickFormatter={formatXAxisDate}
                    />
                    <YAxis
                      stroke={chartConfig.axisStroke}
                      allowDecimals={false}
                    />
                    <RechartsTooltip
                      contentStyle={chartConfig.contentStyle}
                      labelFormatter={(label) =>
                        new Date(label).toLocaleDateString()
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="New Leads"
                      stroke="#3B82F4"
                      strokeWidth={2}
                      dot={{
                        fill: isDark ? "#60A5FA" : "#3B82F6",
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 6 }}
                      isAnimationActive={true}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartContainer>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
          <div
            className={`${
              isDark
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            } rounded-xl shadow-sm border h-full lg:col-span-4`}
          >
            <div
              className={`p-6 border-b ${
                isDark ? "border-gray-600" : "border-gray-300"
              } flex justify-between items-center`}
            >
              <h3 className="text-lg font-bold">Recent Leads</h3>
              <button
                className={`${
                  isDark
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-500"
                } text-sm font-medium flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded`}
              >
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    className={`border-b ${
                      isDark ? "border-gray-600" : "border-gray-300"
                    }`}
                  >
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Name
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Contact
                    </th>
                    <th
                      className={`hidden sm:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Source
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Status
                    </th>
                    <th
                      className={`hidden lg:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                        isDark ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      Added
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`divide-y ${
                    isDark ? "divide-gray-600" : "divide-gray-300"
                  }`}
                >
                  {(stats?.recent_leads || []).map((lead) => (
                    <tr
                      key={lead.id}
                      className={`${
                        isDark ? "hover:bg-blue-900/20" : "hover:bg-blue-50"
                      } cursor-pointer transition-all duration-200 group hover:shadow-sm`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap border-l-4 border-transparent group-hover:border-blue-500">
                        <div className="font-medium group-hover:text-blue-500 transition-colors duration-200">
                          {lead.name}
                        </div>
                        <div
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {lead.company || lead.interest}
                        </div>

                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">{lead.email}</div>
                        <div
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {lead.phone}
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap">
                        <SourceBadge source={lead.source} isDark={isDark} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={lead.status} isDark={isDark} />
                      </td>
                      <td
                        className={`hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div
            className={`${
              isDark
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            } rounded-xl shadow-sm border h-full lg:col-span-2`}
          >
            <div
              className={`p-6 border-b ${
                isDark ? "border-gray-600" : "border-gray-300"
              } flex justify-between items-center`}
            >
              <h3 className="text-lg font-bold">Upcoming Site Visits</h3>
              <button
                className={`${
                  isDark
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-500"
                } text-sm font-medium flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded`}
              >
                View Calendar <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
              {visitsLoading ? (
                <LoadingSpinner isDark={isDark} />
              ) : visitsError ? (
                <ErrorMessage
                  error={visitsError}
                  onRetry={fetchUpcomingVisits}
                  isDark={isDark}
                />
              ) : upcomingVisits.length > 0 ? (
                upcomingVisits.map((visit, index) => (
                  <div
                    key={visit.id}
                    className={`p-4 rounded-lg ${
                      isDark ? "hover:bg-blue-900/10" : "hover:bg-blue-50"
                    } cursor-pointer transition-all duration-200 hover:shadow-sm hover:border-l-4 hover:border-blue-500 ${
                      index !== upcomingVisits.length - 1 ? "mb-3" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">
                        {visit.property_details?.title || "N/A"}
                      </h4>
                      <StatusBadge status={visit.status} isDark={isDark} />
                    </div>
                    <div
                      className={`flex items-center text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      } mb-2`}
                    >
                      <Users className="h-4 w-4 mr-1" />
                      <span>
                        {visit.client_details?.full_name ||
                          visit.client_name_manual ||
                          "N/A"}
                      </span>
                    </div>
                    <div
                      className={`flex items-center text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {formatVisitDate(visit.date)}, {visit.time}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 text-gray-500">
                  No upcoming visits.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <ChartContainer
            className="lg:col-span-2"
            title="Property Types"
            isDark={isDark}
            action={
              <div
                className={`flex items-center ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <PieChartIcon className="h-4 w-4 mr-1" />
                <span className="text-xs">Distribution</span>
              </div>
            }
          >
            {propertyLoading && !animatePropertyTypes ? (
              <LoadingSpinner isDark={isDark} />
            ) : propertyError ? (
              <ErrorMessage error={propertyError} isDark={isDark} />
            ) : propertyTypeData.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={propertyTypeData}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        dataKey="value"
                        label={({ percent }) =>
                          `${(percent * 100).toFixed(0)}%`
                        }
                        isAnimationActive={animatePropertyTypes}
                        animationDuration={800}
                        animationEasing="ease-out"
                      >
                        {propertyTypeData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        contentStyle={chartConfig.contentStyle}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col justify-center">
                  {propertyTypeData.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center mb-3 last:mb-0"
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <div className="flex justify-between w-full">
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium">
                          {item.count} ({item.value}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                className={`text-center p-8 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No property type data available.
              </div>
            )}
          </ChartContainer>

          <ChartContainer
            className="md:col-span-1 lg:col-span-1"
            title="Lead Sources"
            isDark={isDark}
          >
            {leadStatsLoading && !animateLeadSources ? (
              <LoadingSpinner isDark={isDark} />
            ) : leadStatsError ? (
              <ErrorMessage
                error={leadStatsError}
                onRetry={() => refetchLeadStats(timeRange)}
                isDark={isDark}
              />
            ) : leadSourceData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leadSourceData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={true}
                      vertical={false}
                      stroke={chartConfig.gridStroke}
                    />
                    <XAxis
                      type="number"
                      stroke={chartConfig.axisStroke}
                      allowDecimals={false}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      stroke={chartConfig.axisStroke}
                    />
                    <RechartsTooltip
                      formatter={(value) => [value, "Count"]}
                      contentStyle={chartConfig.contentStyle}
                    />
                    <Bar
                      dataKey="value"
                      fill="#4285F4"
                      radius={[0, 4, 4, 0]}
                      isAnimationActive={animateLeadSources}
                      animationDuration={800}
                      animationEasing="ease-out"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                className={`text-center p-8 ${
                  isDark ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No lead source data available.
              </div>
            )}
          </ChartContainer>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 mb-6">
          <div
            className={`${
              isDark
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            } rounded-xl shadow-sm p-6 border h-full lg:col-span-4`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Builder Performance</h3>
              <button
                className={`${
                  isDark
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-500"
                } text-sm font-medium flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded`}
              >
                View All
              </button>
            </div>
            {builderLoading ? (
              <LoadingSpinner isDark={isDark} />
            ) : builderError ? (
              <ErrorMessage error={builderError} onRetry={fetchBuilderPerformance} isDark={isDark} />
            ) : (
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? "border-gray-600" : "border-gray-300"}`}>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-500"}`}>Project</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-500"}`}>Leads</th>
                      <th className={`hidden sm:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-500"}`}>Site Visits</th>
                      <th className={`hidden md:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-500"}`}>Conversions</th>
                      <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-500"}`}>Rate</th>
                      <th className={`hidden sm:table-cell px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? "text-gray-300" : "text-gray-500"}`}>Performance</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? "divide-gray-600" : "divide-gray-300"}`}>
                    {builderPerformance.map((item, idx) => (
                      <tr key={idx} className={`${isDark ? "hover:bg-blue-900/20" : "hover:bg-blue-50"} cursor-pointer transition-all duration-200 group hover:shadow-sm`}>
                        <td className="px-6 py-4 whitespace-nowrap border-l-4 border-transparent group-hover:border-blue-500">
                          <div className="font-medium group-hover:text-blue-500 transition-colors duration-200">{item.title}</div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-600"} group-hover:font-medium`}>{item.leads}</td>
                        <td className={`hidden sm:table-cell px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-600"} group-hover:font-medium`}>{item.visits}</td>
                        <td className={`hidden md:table-cell px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-600"} group-hover:font-medium`}>{item.conversions}</td>
                        <td className={`px-6 py-4 whitespace-nowrap ${isDark ? "text-gray-300" : "text-gray-600"} group-hover:font-medium`}>{item.rate.toFixed(1)}%</td>
                        <td className="hidden sm:table-cell px-6 py-4">
                          <div className={`w-full rounded-full h-1.5 ${isDark ? "bg-gray-600" : "bg-gray-100"}`}>
                            <div
                              className={`${item.color} h-1.5 rounded-full transition-all duration-1000 ease-out group-hover:h-2.5 group-hover:shadow-md group-hover:shadow-blue-500/30`}
                              style={{ width: `${item.rate.toFixed(1)}%` }}
                            ></div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div
            className={`${
              isDark
                ? "bg-gray-700 border-gray-600 text-gray-100"
                : "bg-white border-gray-300 text-gray-900"
            } rounded-xl shadow-sm p-6 border transition-all hover:shadow-md h-full lg:col-span-2`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Team Status</h3>
              <button
                className={`${
                  isDark
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-500"
                } text-sm font-medium flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-50 hover:bg-opacity-20 p-1 rounded`}
              >
                View Team
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto pr-2">
              {teamLoading ? (
                <LoadingSpinner isDark={isDark} />
              ) : teamError ? (
                <ErrorMessage
                  error={teamError}
                  onRetry={fetchTeamUsers}
                  isDark={isDark}
                />
              ) : teamUsers.length > 0 ? (
                teamUsers.map((user) => {
                  const fullName =
                    `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
                    user.username;
                  return (
                    <div
                      key={user.id}
                      className={`flex items-center p-3 rounded-lg border ${
                        isDark
                          ? "border-gray-600 hover:bg-blue-900/20 hover:border-blue-400"
                          : "border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                      } transition-all duration-200 hover:shadow-sm`}
                    >
                      <img
                        src={
                          user.profile_image ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            fullName
                          )}&background=random&color=fff&font-size=0.5`
                        }
                        alt={fullName}
                        className="w-10 h-10 rounded-full mr-3 object-cover"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <h4
                          className={`font-semibold text-md ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {fullName}
                        </h4>
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          } capitalize`}
                        >
                          {user.role}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center p-8 text-gray-500">
                  No team members to display.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ExportOptionsModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onDownloadCsv={handleDownloadCsv}
        onCopyCsv={handleCopyCsv}
        isDark={isDark}
      />
    </div>
  );
};

export default Dashboard;