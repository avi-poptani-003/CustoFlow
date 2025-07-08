import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import moment from "moment";

// FullCalendar imports
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend as RechartsLegend,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
  LabelList, // Import LabelList
} from "recharts";
import {
  Home,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  MapPin,
  Phone,
  Plus,
  Filter,
  Search,
  ChevronRight,
  ChevronLeft,
  ArrowUpRight,
  CalendarDays,
  User,
  Building,
} from "lucide-react";
import Navbar from "../components/common/Navbar";
import siteVisitService from "../services/siteVisitService";

const initialNewVisitFormState = {
  property: "",
  propertyType: "",
  location: "",
  propertyContactName: "",
  propertyContactPhone: "",
  clientName: "",
  clientPhone: "",
  date: moment().format("YYYY-MM-DD"),
  time: "10:00 AM",
  status: "scheduled",
  agent: "",
};

function SiteVisits() {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState("upcoming");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState("This Month");
  const [selectedAgentFilter, setSelectedAgentFilter] = useState("All Agents"); // Or an ID if you change filter logic
  const [selectedPropertyTypeFilter, setSelectedPropertyTypeFilter] =
    useState("All Types");

  const [allVisits, setAllVisits] = useState([]);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVisitData, setNewVisitData] = useState(initialNewVisitFormState);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedVisitForEdit, setSelectedVisitForEdit] = useState(null);
  const [editVisitFormData, setEditVisitFormData] = useState(null);

  const calendarRef = useRef(null);

  const isDark = theme === "dark";
  const secondaryText = isDark ? "text-gray-400" : "text-gray-500";
  const borderColor = isDark ? "border-gray-700" : "border-gray-300";
  const bgColor = isDark ? "bg-gray-900" : "bg-gray-50";
  const textColor = isDark ? "text-gray-100" : "text-gray-900";
  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const inputBg = isDark
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
    : "bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500";

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [visitsResponse, propertiesResponse, usersResponse] =
        await Promise.all([
          siteVisitService.getAllSiteVisits(),
          siteVisitService.getProperties(),
          siteVisitService.getUsers(),
        ]);
      setAllVisits(Array.isArray(visitsResponse) ? visitsResponse : []);
      setProperties(
        Array.isArray(propertiesResponse) ? propertiesResponse : []
      );
      setUsers(Array.isArray(usersResponse) ? usersResponse : []);

      const fetchedUsers = Array.isArray(usersResponse) ? usersResponse : [];
      // Default agent in new visit form to the first user with role 'agent'
      setNewVisitData((prev) => ({
        ...prev,
        agent:
          prev.agent || fetchedUsers.find((u) => u.role === "agent")?.id || "",
      }));
    } catch (err) {
      console.error("Failed to fetch data:", err);
      let errorMessage = "Failed to load data. Please try again.";
      if (
        err.response &&
        err.response.data &&
        typeof err.response.data === "string" &&
        err.response.data.includes("<html")
      ) {
        errorMessage =
          "Failed to load data due to a server error (HTML response received). Please check server logs.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
      setAllVisits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (selectedVisitForEdit) {
      const clientNameDisplay =
        selectedVisitForEdit.client_details?.full_name ||
        selectedVisitForEdit.client_details?.username ||
        selectedVisitForEdit.client_name_manual ||
        "N/A";
      const clientPhoneDisplay =
        selectedVisitForEdit.client_details?.phone_number ||
        selectedVisitForEdit.client_phone_manual ||
        "N/A";

      setEditVisitFormData({
        id: selectedVisitForEdit.id,
        propertyTitle: selectedVisitForEdit.property_details?.title || "N/A",
        propertyType:
          selectedVisitForEdit.property_details?.property_type || "N/A",
        location: selectedVisitForEdit.property_details?.location || "N/A",
        clientName: clientNameDisplay,
        clientPhone: clientPhoneDisplay,
        date: moment(selectedVisitForEdit.date).format("YYYY-MM-DD"),
        time: selectedVisitForEdit.time,
        status: selectedVisitForEdit.status,
        agent: selectedVisitForEdit.agent_details
          ? selectedVisitForEdit.agent_details.id
          : selectedVisitForEdit.agent || "",
        feedback: selectedVisitForEdit.feedback || "",
      });
    } else {
      setEditVisitFormData(null);
    }
  }, [selectedVisitForEdit]);

  const stats = useMemo(() => {
    if (!allVisits || allVisits.length === 0) {
      return [
        {
          title: "Total Visits",
          value: "0",
          icon: Home,
          color: "text-blue-600 dark:text-blue-400",
          bgColor: "bg-blue-100 dark:bg-blue-900/30",
        },
        {
          title: "Completed",
          value: "0",
          icon: CheckCircle,
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-100 dark:bg-green-900/30",
        },
        {
          title: "Cancelled",
          value: "0",
          icon: XCircle,
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-100 dark:bg-red-900/30",
        },
        {
          title: "Upcoming",
          value: "0",
          icon: Clock,
          color: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-100 dark:bg-orange-900/30",
        },
      ].map((stat) => ({ ...stat, change: "N/A", trend: "neutral" }));
    }
    const completedCount = allVisits.filter(
      (v) => v.status === "completed"
    ).length;
    const cancelledCount = allVisits.filter(
      (v) => v.status === "cancelled"
    ).length;
    const upcomingCount = allVisits.filter((v) => {
      const visitMoment = moment(`${v.date} ${v.time}`, "YYYY-MM-DD h:mm A");
      return (
        visitMoment.isValid() &&
        visitMoment.isSameOrAfter(moment()) &&
        !["completed", "cancelled"].includes(v.status)
      );
    }).length;
    return [
      {
        title: "Total Visits",
        value: allVisits.length.toString(),
        change: "",
        trend: "neutral",
        icon: Home,
        color: "text-blue-600 dark:text-blue-400",
        bgColor: "bg-blue-100 dark:bg-blue-900/30",
      },
      {
        title: "Completed",
        value: completedCount.toString(),
        change: "",
        trend: "neutral",
        icon: CheckCircle,
        color: "text-green-600 dark:text-green-400",
        bgColor: "bg-green-100 dark:bg-green-900/30",
      },
      {
        title: "Cancelled",
        value: cancelledCount.toString(),
        change: "",
        trend: "neutral",
        icon: XCircle,
        color: "text-red-600 dark:text-red-400",
        bgColor: "bg-red-100 dark:bg-red-900/30",
      },
      {
        title: "Upcoming",
        value: upcomingCount.toString(),
        change: "",
        trend: "neutral",
        icon: Clock,
        color: "text-orange-600 dark:text-orange-400",
        bgColor: "bg-orange-100 dark:bg-orange-900/30",
      },
    ];
  }, [allVisits]);

  const applyFilters = (visits) => {
    return visits.filter((visit) => {
      const propertyTitle = visit.property_details?.title || "";
      const clientNameForSearch =
        visit.client_details?.full_name ||
        visit.client_details?.username ||
        visit.client_name_manual ||
        "";
      const agentName =
        visit.agent_details?.full_name || visit.agent_details?.username || "";
      const locationName = visit.property_details?.location || "";

      const agentFilterValue =
        selectedAgentFilter === "All Agents" ? "" : selectedAgentFilter;

      return (
        (propertyTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          clientNameForSearch
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          agentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          locationName.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (selectedAgentFilter === "All Agents" ||
          visit.agent_details?.id === parseInt(agentFilterValue) ||
          agentName === agentFilterValue) &&
        (selectedPropertyTypeFilter === "All Types" ||
          (visit.property_details?.property_type &&
            visit.property_details.property_type.toLowerCase() ===
              selectedPropertyTypeFilter.toLowerCase()))
      );
    });
  };

  const filteredUpcomingVisits = useMemo(() => {
    const upcoming = allVisits.filter((visit) => {
      const visitDateTime = moment(
        `${visit.date} ${visit.time}`,
        "YYYY-MM-DD h:mm A"
      );
      return (
        visitDateTime.isValid() &&
        visitDateTime.isSameOrAfter(moment()) &&
        !["completed", "cancelled"].includes(visit.status)
      );
    });
    return applyFilters(upcoming);
  }, [allVisits, searchQuery, selectedAgentFilter, selectedPropertyTypeFilter]);

  const filteredPastVisits = useMemo(() => {
    const past = allVisits.filter((visit) => {
      const visitDateTime = moment(
        `${visit.date} ${visit.time}`,
        "YYYY-MM-DD h:mm A"
      );
      return (
        (visitDateTime.isValid() && visitDateTime.isBefore(moment())) ||
        ["completed", "cancelled"].includes(visit.status)
      );
    });
    return applyFilters(past);
  }, [allVisits, searchQuery, selectedAgentFilter, selectedPropertyTypeFilter]);

  const calendarEvents = useMemo(() => {
    return allVisits
      .map((visit) => {
        const visitDate = moment(visit.date, "YYYY-MM-DD");
        const timeParts = String(visit.time || "").match(
          /(\d+):(\d+)\s*(AM|PM)/i
        );

        if (!timeParts || !visitDate.isValid()) {
          console.warn(
            `Could not parse date/time for visit: ${visit.id} - Date: "${visit.date}", Time: "${visit.time}"`
          );
          return null;
        }

        let hours = parseInt(timeParts[1], 10);
        const minutes = parseInt(timeParts[2], 10);
        const ampm = timeParts[3].toUpperCase();

        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;

        const startDateTime = visitDate
          .clone()
          .hours(hours)
          .minutes(minutes)
          .toDate();
        let endDateTime = moment(startDateTime).add(1, "hour").toDate();
        if (moment(endDateTime).isSameOrBefore(startDateTime)) {
          endDateTime = moment(startDateTime).add(1, "hour").toDate();
        }

        const propertyTitle = visit.property_details?.title || "N/A Property";
        const clientNameDisplay =
          visit.client_details?.full_name ||
          visit.client_details?.username ||
          visit.client_name_manual ||
          "N/A Client";

        let eventStyling = {};
        const status = visit.status;
        if (status === "completed") {
          eventStyling = {
            backgroundColor: isDark ? "#166534" : "#D1FAE5",
            borderColor: isDark ? "#15803D" : "#A7F3D0",
            textColor: isDark ? "#ECFDF5" : "#065F46",
          };
        } else if (status === "cancelled" || status === "no_show") {
          eventStyling = {
            backgroundColor: isDark ? "#991B1B" : "#FEE2E2",
            borderColor: isDark ? "#B91C1C" : "#FECACA",
            textColor: isDark ? "#FEF2F2" : "#991B1B",
          };
        } else if (status === "confirmed") {
          eventStyling = {
            backgroundColor: isDark ? "#1E40AF" : "#DBEAFE",
            borderColor: isDark ? "#1D4ED8" : "#BFDBFE",
            textColor: isDark ? "#EFF6FF" : "#1E3A8A",
          };
        } else {
          // scheduled or other
          eventStyling = {
            backgroundColor: isDark ? "#78350F" : "#FEF3C7",
            borderColor: isDark ? "#9A3412" : "#FDE68A",
            textColor: isDark ? "#FFFBEB" : "#78350F",
          };
        }

        return {
          id: visit.id.toString(),
          title: `${propertyTitle} - ${clientNameDisplay}`,
          start: startDateTime,
          end: endDateTime,
          allDay: false,
          extendedProps: {
            visit: visit,
            status: visit.status,
            propertyTitle: propertyTitle,
            clientName: clientNameDisplay,
          },
          ...eventStyling,
        };
      })
      .filter((event) => event !== null);
  }, [allVisits, isDark]);

  const visitTrendsData = useMemo(() => {
    if (!allVisits || allVisits.length === 0) return [];

    const now = moment();
    let startDate, endDate;

    switch (selectedDateRange) {
      case "This Month":
        startDate = now.clone().startOf("month");
        endDate = now.clone().endOf("month");
        break;
      case "Last 3 Months":
        startDate = now.clone().subtract(2, "months").startOf("month"); // Includes current month
        endDate = now.clone().endOf("month");
        break;
      case "Last 6 Months":
        startDate = now.clone().subtract(5, "months").startOf("month"); // Includes current month
        endDate = now.clone().endOf("month");
        break;
      case "This Year":
        startDate = now.clone().startOf("year");
        endDate = now.clone().endOf("year");
        break;
      default: // Should not happen with current UI, but as a fallback
        startDate = now.clone().startOf("month");
        endDate = now.clone().endOf("month");
    }

    const filteredVisitsForTrends = allVisits.filter((visit) => {
      const visitMoment = moment(visit.date, "YYYY-MM-DD");
      // Ensure visitMoment is valid and within the selected range (inclusive)
      return (
        visitMoment.isValid() &&
        visitMoment.isBetween(startDate, endDate, null, "[]")
      );
    });

    const monthlyData = {};

    filteredVisitsForTrends.forEach((visit) => {
      const visitMoment = moment(visit.date, "YYYY-MM-DD");
      // This check is technically redundant due to pre-filtering, but good for safety
      if (!visitMoment.isValid()) return;

      const monthYear = visitMoment.format("YYYY-MM");
      const monthDisplay = visitMoment.format("MMM YY");

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = {
          date: monthDisplay, // Used for X-axis label
          key: monthYear, // Used for sorting
          scheduled: 0,
          completed: 0,
          cancelled: 0,
        };
      }

      if (["scheduled", "confirmed"].includes(visit.status)) {
        monthlyData[monthYear].scheduled += 1;
      }
      if (visit.status === "completed") {
        monthlyData[monthYear].completed += 1;
      }
      if (visit.status === "cancelled" || visit.status === "no_show") {
        monthlyData[monthYear].cancelled += 1;
      }
    });

    // Sort the aggregated data by month/year
    return Object.values(monthlyData).sort(
      (a, b) =>
        moment(a.key, "YYYY-MM").valueOf() - moment(b.key, "YYYY-MM").valueOf()
    );
  }, [allVisits, selectedDateRange]);

  const conversionFunnelData = useMemo(() => {
    if (!allVisits || allVisits.length === 0) return [];

    const validVisits = allVisits.filter((v) =>
      moment(v.date + " " + v.time, "YYYY-MM-DD hh:mm A").isValid()
    );

    const totalScheduledForFunnel = validVisits.filter((v) =>
      ["scheduled", "confirmed", "completed", "cancelled", "no_show"].includes(
        v.status
      )
    ).length;

    const completedCount = validVisits.filter(
      (v) => v.status === "completed"
    ).length;

    const funnel = [];

    if (totalScheduledForFunnel > 0) {
      funnel.push({
        name: "Visits Scheduled",
        value: 100, // Base for percentage
        actualCount: totalScheduledForFunnel,
      });
      funnel.push({
        name: "Visits Completed",
        value:
          parseFloat(
            ((completedCount / totalScheduledForFunnel) * 100).toFixed(1)
          ) || 0,
        actualCount: completedCount,
      });
    } else {
      // Handle case with no visits to avoid division by zero
      funnel.push({ name: "Visits Scheduled", value: 0, actualCount: 0 });
      funnel.push({ name: "Visits Completed", value: 0, actualCount: 0 });
    }

    return funnel;
  }, [allVisits]);

  const handleNewVisitChange = (e) => {
    const { name, value } = e.target;
    setNewVisitData((prev) => {
      let updatedState = { ...prev };
      if (name === "property") {
        const propertyId = value ? parseInt(value) : "";
        updatedState.property = propertyId;
        const selectedProperty = properties.find((p) => p.id === propertyId);
        if (selectedProperty) {
          updatedState.propertyType = selectedProperty.property_type || "";
          updatedState.location = selectedProperty.location || "";
          updatedState.propertyContactName =
            selectedProperty.contact_name || "";
          updatedState.propertyContactPhone =
            selectedProperty.contact_phone || "";
        } else {
          // Reset property derived fields if no property is selected
          updatedState = {
            ...updatedState,
            propertyType: "",
            location: "",
            propertyContactName: "",
            propertyContactPhone: "",
          };
        }
      } else if (name === "agent") {
        updatedState.agent = value ? parseInt(value) : ""; // Ensure agent ID is stored
      } else {
        updatedState[name] = value;
      }
      return updatedState;
    });
  };

  const handleAddNewVisit = async (e) => {
    e.preventDefault();
    setError(null);
    // Validate time format
    if (!/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(newVisitData.time)) {
      setError(
        "Please enter time in HH:MM AM/PM format (e.g., 10:00 AM or 2:30 PM)."
      );
      return;
    }
    // Validate date format
    if (!moment(newVisitData.date, "YYYY-MM-DD", true).isValid()) {
      setError("Please enter a valid date in YYYY-MM-DD format.");
      return;
    }
    // Check required fields
    if (
      !newVisitData.property ||
      !newVisitData.clientName.trim() ||
      !newVisitData.agent
    ) {
      setError("Please select Property, enter Client Name, and select Agent.");
      return;
    }

    try {
      const payload = {
        property: newVisitData.property, // Should be ID
        client_name: newVisitData.clientName.trim(),
        client_phone: newVisitData.clientPhone.trim(),
        agent: newVisitData.agent, // Should be ID
        date: newVisitData.date,
        time: newVisitData.time,
        status: newVisitData.status,
        // feedback is not in the new visit form initially
      };
      await siteVisitService.createSiteVisit(payload);
      setIsAddModalOpen(false);
      const currentAgent = newVisitData.agent; // Preserve agent for next form if desired
      setNewVisitData({ ...initialNewVisitFormState, agent: currentAgent });
      await fetchAllData(); // Refresh data
    } catch (err) {
      console.error("Failed to schedule new visit:", err);
      let errorMessage = "Failed to schedule new visit. ";
      if (err.response && err.response.data) {
        const errors = err.response.data;
        if (typeof errors === "object") {
          errorMessage += Object.entries(errors)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
            )
            .join("; ");
        } else if (typeof errors === "string" && errors.includes("<html")) {
          // Handle HTML error responses more gracefully
          errorMessage += "Server error occurred (HTML response).";
        } else {
          errorMessage += String(errors);
        }
      } else if (err.message) {
        errorMessage += err.message;
      }
      setError(errorMessage);
    }
  };

  // Handler for when a date is clicked on the calendar
  const handleDateClick = (clickInfo) => {
    // Find the first user with role 'agent' to set as default
    const defaultAgent =
      users.find((u) => u.role === "agent")?.id ||
      initialNewVisitFormState.agent;
    setNewVisitData({
      ...initialNewVisitFormState,
      date: moment(clickInfo.dateStr).format("YYYY-MM-DD"),
      time: clickInfo.allDay
        ? "10:00 AM"
        : moment(clickInfo.dateStr).format("h:mm A"), // Sensible default time
      agent: defaultAgent,
    });
    setIsAddModalOpen(true);
    setError(null); // Clear previous errors
  };

  // Handler for when an event (a visit) is clicked on the calendar
  const handleEventClick = (clickInfo) => {
    const visitToEdit = clickInfo.event.extendedProps.visit;
    setSelectedVisitForEdit(visitToEdit);
    setIsEditModalOpen(true);
    setError(null); // Clear previous errors
  };

  const openAddModal = () => {
    const defaultAgent =
      users.find((u) => u.role === "agent")?.id ||
      initialNewVisitFormState.agent;
    setNewVisitData({
      ...initialNewVisitFormState,
      date: moment().format("YYYY-MM-DD"), // Default to today
      time: moment().format("h:mm A"), // Default to current time, formatted
      agent: defaultAgent,
    });
    setIsAddModalOpen(true);
    setError(null);
  };

  const handleEditVisitChange = (e) => {
    const { name, value } = e.target;
    setEditVisitFormData((prev) => {
      let updatedValue = value;
      // Ensure agent ID is stored as integer if it's from a select
      if (name === "agent") {
        updatedValue = value ? parseInt(value) : "";
      }
      return { ...prev, [name]: updatedValue };
    });
  };

  const handleUpdateVisit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!editVisitFormData) return;

    // Validate time format
    if (!/^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(editVisitFormData.time)) {
      setError("Please enter time in HH:MM AM/PM format.");
      return;
    }
    // Validate date format
    if (!moment(editVisitFormData.date, "YYYY-MM-DD", true).isValid()) {
      setError("Please enter a valid date.");
      return;
    }
    if (!editVisitFormData.agent) {
      setError("Please select an Agent.");
      return;
    }

    try {
      const payload = {
        // Only send fields that can be updated
        // Property and client are not editable in this form as per its read-only fields
        agent: editVisitFormData.agent, // Should be ID
        date: editVisitFormData.date,
        time: editVisitFormData.time,
        status: editVisitFormData.status,
        feedback: editVisitFormData.feedback,
      };
      await siteVisitService.updateSiteVisit(editVisitFormData.id, payload);
      setIsEditModalOpen(false);
      setSelectedVisitForEdit(null); // Clear selected visit
      await fetchAllData(); // Refresh data
    } catch (err) {
      console.error("Failed to update visit:", err);
      let errorMessage = "Failed to update visit. ";
      if (err.response && err.response.data) {
        const errors = err.response.data;
        if (typeof errors === "object") {
          errorMessage += Object.entries(errors)
            .map(
              ([key, value]) =>
                `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
            )
            .join("; ");
        } else if (typeof errors === "string" && errors.includes("<html")) {
          errorMessage += "Server error occurred (HTML response).";
        } else {
          errorMessage += String(errors);
        }
      } else if (err.message) {
        errorMessage += err.message;
      }
      setError(errorMessage);
    }
  };

  const handleDeleteVisit = async () => {
    if (!selectedVisitForEdit || !selectedVisitForEdit.id) return;
    // Confirmation dialog
    if (
      window.confirm(
        "Are you sure you want to delete this visit? This action cannot be undone."
      )
    ) {
      setError(null);
      try {
        await siteVisitService.deleteSiteVisit(selectedVisitForEdit.id);
        setIsEditModalOpen(false);
        setSelectedVisitForEdit(null); // Clear selected visit
        await fetchAllData(); // Refresh data
      } catch (err) {
        console.error("Failed to delete visit:", err);
        setError("Failed to delete visit. Please try again.");
      }
    }
  };

  // Memoized list of available agents for filter dropdown
  const availableAgents = useMemo(() => {
    // Filter users by role 'agent' and ensure uniqueness
    const uniqueAgents = users
      .filter((user) => user.role === "agent")
      .reduce((acc, current) => {
        const x = acc.find((item) => item.id === current.id);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, []);
    const agentOptions = uniqueAgents.map((a) => ({
      id: a.id,
      name: a.full_name || a.username || `Agent ${a.id}`,
    }));
    return [{ id: "All Agents", name: "All Agents" }, ...agentOptions]; // Add "All Agents" option
  }, [users]);

  // Memoized list of available property types for filter dropdown
  const availablePropertyTypes = useMemo(() => {
    const types = new Set(
      properties.map((p) => p.property_type).filter(Boolean)
    ); // Get unique, non-empty types
    return ["All Types", ...Array.from(types)]; // Add "All Types" option
  }, [properties]);

  // Memoized list of users with role 'agent' for assignment dropdowns
  const agents = useMemo(
    () => users.filter((user) => user.role === "agent"),
    [users]
  ); //

  // Custom rendering for calendar events
  const eventContent = (arg) => {
    const { propertyTitle, clientName } = arg.event.extendedProps;
    const timeText = moment(arg.event.start).format("h:mma"); // Format time
    return (
      <div className="p-0.5 text-[0.7rem] leading-tight overflow-hidden">
        <div className="font-semibold truncate">{propertyTitle}</div>
        <div className="truncate">{clientName}</div>
        <div className="truncate">{timeText}</div>
      </div>
    );
  };

  // Custom rendering for calendar day headers
  const dayHeaderContent = (arg) => {
    const mDate = moment(arg.date);
    const dayOfWeek = mDate.format("ddd");
    const dayOfMonth = mDate.format("D");
    const isToday = mDate.isSame(new Date(), "day");

    // For month view, use FullCalendar's default text or a simpler format
    if (arg.view.type === "dayGridMonth") {
      return (
        <div
          className={`text-center py-2 px-1 text-xs font-medium ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {arg.text} {/* Default text for month view numbers */}
        </div>
      );
    }

    // For week and day views, show day abbreviation and number
    if (arg.view.type === "timeGridWeek" || arg.view.type === "timeGridDay") {
      let fullDateText = mDate.format("ddd, MMM D");
      if (arg.view.type === "timeGridDay") {
        // Simpler for day view header
        return (
          <div
            className={`text-center py-1 px-1 text-xs font-medium ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}
          >
            {fullDateText}
          </div>
        );
      }
      return (
        <div
          className={`text-center py-1 px-1 text-xs font-medium ${
            isDark ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {dayOfWeek}
          <br />
          <span
            className={`text-sm font-bold ${
              isToday
                ? `bg-blue-500 text-white rounded-full w-6 h-6 inline-flex items-center justify-center`
                : isDark
                ? "text-gray-200"
                : "text-gray-800"
            }`}
          >
            {dayOfMonth}
          </span>
        </div>
      );
    }
    return arg.text; // Fallback
  };

  const getClientDisplayName = (visit) => {
    if (!visit) return "N/A";
    return (
      visit.client_details?.full_name ||
      visit.client_details?.username ||
      visit.client_name_manual ||
      "N/A"
    );
  };

  const getClientDisplayPhone = (visit) => {
    if (!visit) return "N/A";
    return (
      visit.client_details?.phone_number || visit.client_phone_manual || "N/A"
    );
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${bgColor}`}
      >
        <p className={textColor}>Loading site visits...</p>
      </div>
    );
  }

  // Error state (if not in a modal, to avoid covering modal error messages)
  if (error && !isAddModalOpen && !isEditModalOpen) {
    return (
      <div
        className={`min-h-screen flex flex-col items-center justify-center ${bgColor} p-4`}
      >
        <Navbar /> {/* Assuming Navbar is always present */}
        <div
          className={`${cardBg} p-6 rounded-lg shadow-xl text-center max-w-md mt-8`}
        >
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Site Visits</h2>
          <p className={`${secondaryText} mb-4 whitespace-pre-wrap`}>{error}</p>
          <button
            onClick={fetchAllData} // Allow user to retry fetching data
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main component render
  return (
    <div
      className={`min-h-screen ${bgColor} ${textColor} fullcalendar-themed-container ${
        isDark ? "dark" : ""
      }`}
    >
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Site Visits</h1>
            <p className={secondaryText}>
              Manage and track property site visits
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Schedule Visit
          </button>
        </div>

        {/* Add New Visit Modal */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur flex items-center justify-center z-50 p-4">
            <div
              className={`${cardBg} p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}
            >
              <h2 className="text-xl font-bold mb-4">Schedule New Visit</h2>
              {/* Error display within modal */}
              {error &&
                !loading && ( // Show error if present and not loading
                  <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                  >
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline whitespace-pre-wrap">
                      {" "}
                      {error}
                    </span>
                  </div>
                )}
              <form onSubmit={handleAddNewVisit}>
                {/* Property Details Fieldset */}
                <fieldset
                  className={`border p-4 rounded-md mb-4 ${borderColor}`}
                >
                  <legend className="text-sm font-medium px-1">
                    Property Details
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="property"
                        className="block text-sm font-medium mb-1"
                      >
                        Property Name
                      </label>
                      <select
                        name="property"
                        id="property"
                        value={newVisitData.property}
                        onChange={handleNewVisitChange}
                        required
                        className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                      >
                        <option value="">Select Property</option>
                        {properties.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="propertyType"
                        className="block text-sm font-medium mb-1"
                      >
                        Property Type
                      </label>
                      <input
                        type="text"
                        name="propertyType"
                        id="propertyType"
                        value={newVisitData.propertyType}
                        readOnly
                        disabled
                        className={`w-full p-2 rounded-md border ${inputBg} cursor-not-allowed`}
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="location"
                      className="block text-sm font-medium mb-1"
                    >
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      id="location"
                      value={newVisitData.location}
                      readOnly
                      disabled
                      className={`w-full p-2 rounded-md border ${inputBg} cursor-not-allowed`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="propertyContactName"
                        className="block text-sm font-medium mb-1"
                      >
                        Property Contact Name
                      </label>
                      <input
                        type="text"
                        name="propertyContactName"
                        id="propertyContactName"
                        value={newVisitData.propertyContactName}
                        readOnly
                        disabled
                        className={`w-full p-2 rounded-md border ${inputBg} cursor-not-allowed`}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="propertyContactPhone"
                        className="block text-sm font-medium mb-1"
                      >
                        Property Contact Phone
                      </label>
                      <input
                        type="text"
                        name="propertyContactPhone"
                        id="propertyContactPhone"
                        value={newVisitData.propertyContactPhone}
                        readOnly
                        disabled
                        className={`w-full p-2 rounded-md border ${inputBg} cursor-not-allowed`}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Client Details Fieldset */}
                <fieldset
                  className={`border p-4 rounded-md mb-4 ${borderColor}`}
                >
                  <legend className="text-sm font-medium px-1">
                    Client Details
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="clientName"
                        className="block text-sm font-medium mb-1"
                      >
                        Client Name
                      </label>
                      <input
                        type="text"
                        name="clientName"
                        id="clientName"
                        value={newVisitData.clientName}
                        onChange={handleNewVisitChange}
                        required
                        placeholder="Enter client's full name"
                        className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="clientPhone"
                        className="block text-sm font-medium mb-1"
                      >
                        Client Phone
                      </label>
                      <input
                        type="tel"
                        name="clientPhone"
                        id="clientPhone"
                        value={newVisitData.clientPhone}
                        onChange={handleNewVisitChange}
                        placeholder="Enter client's phone number"
                        className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                  </div>
                </fieldset>

                {/* Visit Details Fieldset */}
                <fieldset
                  className={`border p-4 rounded-md mb-4 ${borderColor}`}
                >
                  <legend className="text-sm font-medium px-1">
                    Visit Details
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="date"
                        className="block text-sm font-medium mb-1"
                      >
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        id="date"
                        value={newVisitData.date}
                        onChange={handleNewVisitChange}
                        required
                        className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500 ${
                          isDark ? "text-gray-100" : "text-gray-900"
                        }`}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="time"
                        className="block text-sm font-medium mb-1"
                      >
                        Time (e.g., 10:00 AM)
                      </label>
                      <input
                        type="text"
                        name="time"
                        id="time"
                        value={newVisitData.time}
                        onChange={handleNewVisitChange}
                        required
                        placeholder="HH:MM AM/PM"
                        className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="agent"
                        className="block text-sm font-medium mb-1"
                      >
                        Assigned Agent
                      </label>
                      <select
                        name="agent"
                        id="agent"
                        value={newVisitData.agent}
                        onChange={handleNewVisitChange}
                        required
                        className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                      >
                        <option value="">Select Agent</option>
                        {/* 'agents' list is already filtered for role 'agent' */}
                        {agents.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.full_name || a.username}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="status"
                        className="block text-sm font-medium mb-1"
                      >
                        Status
                      </label>
                      <select
                        name="status"
                        id="status"
                        value={newVisitData.status}
                        onChange={handleNewVisitChange}
                        className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        {/* Other statuses like 'completed' typically set after visit */}
                      </select>
                    </div>
                  </div>
                </fieldset>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setError(null);
                    }}
                    className={`px-4 py-2 rounded-md border ${borderColor} ${
                      isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Schedule Visit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Visit Modal */}
        {isEditModalOpen && editVisitFormData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur flex items-center justify-center z-50 p-4">
            <div
              className={`${cardBg} p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto`}
            >
              <h2 className="text-xl font-bold mb-4">Edit Site Visit</h2>
              {/* Error display within modal */}
              {error && !loading && (
                <div
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                  role="alert"
                >
                  <strong className="font-bold">Error!</strong>
                  <span className="block sm:inline whitespace-pre-wrap">
                    {" "}
                    {error}
                  </span>
                </div>
              )}
              <form onSubmit={handleUpdateVisit}>
                {/* Read-only Visit Info */}
                <fieldset
                  className={`border p-4 rounded-md mb-4 ${borderColor} opacity-75`}
                >
                  <legend className="text-sm font-medium px-1">
                    Visit Information (Read-only)
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      {" "}
                      <label className="block text-sm font-medium mb-1">
                        Property
                      </label>{" "}
                      <input
                        type="text"
                        value={editVisitFormData.propertyTitle}
                        readOnly
                        disabled
                        className={`w-full p-2 rounded-md border ${inputBg} cursor-not-allowed`}
                      />{" "}
                    </div>
                    <div>
                      {" "}
                      <label className="block text-sm font-medium mb-1">
                        Client
                      </label>{" "}
                      <input
                        type="text"
                        value={editVisitFormData.clientName}
                        readOnly
                        disabled
                        className={`w-full p-2 rounded-md border ${inputBg} cursor-not-allowed`}
                      />{" "}
                    </div>
                  </div>
                </fieldset>

                {/* Update Visit Details Fieldset */}
                <fieldset
                  className={`border p-4 rounded-md mb-4 ${borderColor}`}
                >
                  <legend className="text-sm font-medium px-1">
                    Update Visit Details
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      {" "}
                      <label
                        htmlFor="editDate"
                        className="block text-sm font-medium mb-1"
                      >
                        Date
                      </label>{" "}
                      <input
                        type="date"
                        name="date"
                        id="editDate"
                        value={editVisitFormData.date}
                        onChange={handleEditVisitChange}
                        required
                        className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500 ${
                          isDark ? "text-gray-100" : "text-gray-900"
                        }`}
                      />{" "}
                    </div>
                    <div>
                      {" "}
                      <label
                        htmlFor="editTime"
                        className="block text-sm font-medium mb-1"
                      >
                        Time (e.g., 10:00 AM)
                      </label>{" "}
                      <input
                        type="text"
                        name="time"
                        id="editTime"
                        value={editVisitFormData.time}
                        onChange={handleEditVisitChange}
                        required
                        placeholder="HH:MM AM/PM"
                        className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                      />{" "}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="editAgent"
                        className="block text-sm font-medium mb-1"
                      >
                        Agent
                      </label>
                      <select
                        name="agent"
                        id="editAgent"
                        value={editVisitFormData.agent}
                        onChange={handleEditVisitChange}
                        required
                        className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                      >
                        <option value="">Select Agent</option>
                        {/* 'agents' list is already filtered for role 'agent' */}
                        {agents.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.full_name || a.username}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="editStatus"
                        className="block text-sm font-medium mb-1"
                      >
                        Status
                      </label>
                      <select
                        name="status"
                        id="editStatus"
                        value={editVisitFormData.status}
                        onChange={handleEditVisitChange}
                        className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                      >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="no_show">No Show</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label
                      htmlFor="editFeedback"
                      className="block text-sm font-medium mb-1"
                    >
                      Feedback
                    </label>
                    <textarea
                      name="feedback"
                      id="editFeedback"
                      value={editVisitFormData.feedback || ""}
                      onChange={handleEditVisitChange}
                      rows="3"
                      className={`w-full p-2 rounded-md border ${inputBg} focus:ring-blue-500 focus:border-blue-500`}
                    ></textarea>
                  </div>
                </fieldset>
                {/* Modal Actions */}
                <div className="flex justify-between items-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleDeleteVisit}
                    className={`px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors`}
                  >
                    {" "}
                    Delete Visit{" "}
                  </button>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditModalOpen(false);
                        setSelectedVisitForEdit(null);
                        setError(null);
                      }}
                      className={`px-4 py-2 rounded-md border ${borderColor} ${
                        isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"
                      }`}
                    >
                      {" "}
                      Cancel{" "}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      {" "}
                      Update Visit{" "}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className={`${cardBg} ${borderColor} rounded-xl shadow-sm p-6 border transition-all hover:shadow-md hover:border-blue-500 hover:translate-y-[-2px] duration-300 md:col-span-3 lg:col-span-3 group`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={secondaryText}>{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1 group-hover:text-blue-500 transition-colors duration-300">
                    {stat.value}
                  </h3>
                  {stat.change && (
                    <div
                      className={`flex items-center mt-1 ${
                        stat.trend === "up"
                          ? "text-green-500"
                          : stat.trend === "down"
                          ? "text-red-500"
                          : secondaryText
                      }`}
                    >
                      {" "}
                      {stat.trend !== "neutral" && (
                        <ArrowUpRight
                          className={`h-3 w-3 mr-1 ${
                            stat.trend === "down" ? "rotate-90" : ""
                          }`}
                        />
                      )}{" "}
                      <span className="text-xs font-medium">{stat.change}</span>{" "}
                    </div>
                  )}
                </div>
                <div
                  className={`${
                    stat.bgColor
                  } p-3 rounded-full transition-all duration-300 group-hover:scale-110 group-hover:bg-blue-100 group-hover:text-blue-600 ${
                    isDark ? "group-hover:bg-blue-900/50" : ""
                  }`}
                >
                  {" "}
                  <stat.icon
                    className={`h-6 w-6 ${stat.color} group-hover:text-blue-600 transition-colors duration-300`}
                  />{" "}
                </div>
              </div>
            </div>
          ))}

          {/* FullCalendar */}
          <div
            className={`${cardBg} ${borderColor} mt-6 rounded-xl shadow-sm border md:col-span-6 lg:col-span-12`}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <CalendarDays className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                Visits Calendar
              </h2>
            </div>
            <div className="p-2 fc-wrapper">
              {" "}
              {/* Wrapper for potential custom scrollbars or padding */}
              <FullCalendar
                ref={calendarRef}
                key={isDark.toString() + allVisits.length} // Re-render on theme change or data change
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  listPlugin,
                  interactionPlugin,
                ]}
                initialView="dayGridMonth"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                }}
                events={calendarEvents}
                height="700px" // Adjust height as needed
                selectable={true} // Allow date selection
                dateClick={handleDateClick} // Handle date click to open add modal
                eventClick={handleEventClick} // Handle event click to open edit modal
                eventContent={eventContent} // Custom event rendering
                dayHeaderContent={dayHeaderContent} // Custom day header rendering
                buttonText={{
                  // Customize button text if needed
                  today: "Today",
                  month: "Month",
                  week: "Week",
                  day: "Day",
                  list: "List",
                }}
                viewClassNames={isDark ? "fc-dark" : "fc-light"} // Apply dark/light theme classes
                eventTimeFormat={{
                  // Consistent time formatting for events
                  hour: "numeric",
                  minute: "2-digit",
                  meridiem: "short",
                }}
                // dayCellClassNames={isDark ? 'fc-day-dark' : 'fc-day-light'}
                // moreLinkClassNames={isDark ? 'fc-more-link-dark' : 'fc-more-link-light'}
              />
            </div>
          </div>

          {/* Visit Trends Chart */}
          <div
            className={`${cardBg} ${borderColor} rounded-xl shadow-sm p-6 border md:col-span-4 lg:col-span-8 transition-all duration-300 hover:shadow-md hover:border-blue-500 group`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold group-hover:text-blue-500 transition-colors duration-300">
                Visit Trends
              </h3>
              {/* Date Range Picker */}
              <div className="flex space-x-2">
                {[
                  "This Month",
                  "Last 3 Months",
                  "Last 6 Months",
                  "This Year",
                ].map((range) => (
                  <button
                    key={range}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      selectedDateRange === range
                        ? "bg-blue-600 text-white"
                        : isDark
                        ? "text-gray-400 hover:bg-blue-600/20 hover:text-blue-300"
                        : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                    onClick={() => setSelectedDateRange(range)}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80">
              {" "}
              {/* Fixed height for the chart container */}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visitTrendsData}>
                  <defs>
                    <linearGradient
                      id="colorScheduled"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      {" "}
                      <stop
                        offset="5%"
                        stopColor="#4285F4"
                        stopOpacity={0.8}
                      />{" "}
                      <stop
                        offset="95%"
                        stopColor="#4285F4"
                        stopOpacity={0.1}
                      />{" "}
                    </linearGradient>
                    <linearGradient
                      id="colorCompleted"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      {" "}
                      <stop
                        offset="5%"
                        stopColor="#34A853"
                        stopOpacity={0.8}
                      />{" "}
                      <stop
                        offset="95%"
                        stopColor="#34A853"
                        stopOpacity={0.1}
                      />{" "}
                    </linearGradient>
                    <linearGradient
                      id="colorCancelled"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      {" "}
                      <stop
                        offset="5%"
                        stopColor="#EA4335"
                        stopOpacity={0.8}
                      />{" "}
                      <stop
                        offset="95%"
                        stopColor="#EA4335"
                        stopOpacity={0.1}
                      />{" "}
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#374151" : "#f3f4f6"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    stroke={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <YAxis
                    stroke={isDark ? "#9CA3AF" : "#6B7280"}
                    allowDecimals={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                      border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                      borderRadius: "8px",
                      color: isDark ? "#F3F4F6" : "#1F2937",
                    }}
                    formatter={(value, name) => [
                      value,
                      name.charAt(0).toUpperCase() + name.slice(1),
                    ]}
                  />
                  <RechartsLegend />
                  <Area
                    type="monotone"
                    dataKey="scheduled"
                    stroke="#4285F4"
                    fillOpacity={1}
                    fill="url(#colorScheduled)"
                    name="Scheduled/Confirmed"
                  />
                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#34A853"
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                    name="Completed"
                  />
                  <Area
                    type="monotone"
                    dataKey="cancelled"
                    stroke="#EA4335"
                    fillOpacity={1}
                    fill="url(#colorCancelled)"
                    name="Cancelled"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Visit Conversion Funnel Chart */}
          <div
            className={`${cardBg} ${borderColor} rounded-xl shadow-sm p-6 border md:col-span-2 lg:col-span-4 transition-all duration-300 hover:shadow-md hover:border-blue-500 group`}
          >
            <h3 className="text-lg font-bold mb-6 group-hover:text-blue-500 transition-colors duration-300">
              Visit Conversion Funnel
            </h3>
            <div className="h-80">
              {" "}
              {/* Fixed height for the chart container */}
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={conversionFunnelData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke={isDark ? "#374151" : "#f3f4f6"}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    stroke={isDark ? "#9CA3AF" : "#6B7280"}
                    tickFormatter={(tick) => `${tick}%`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={130}
                    stroke={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
                      border: `1px solid ${isDark ? "#374151" : "#E5E7EB"}`,
                      borderRadius: "8px",
                      color: isDark ? "#F3F4F6" : "#1F2937",
                    }}
                    formatter={(value, name, props) => {
                      // Access the full data object for the current bar
                      const stageData = props.payload;
                      return [
                        `${stageData.value}% (Count: ${stageData.actualCount})`,
                        stageData.name,
                      ];
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#4285F4"
                    radius={[0, 4, 4, 0]}
                    barSize={25}
                  >
                    <LabelList
                      dataKey="actualCount"
                      position="right"
                      style={{ fill: isDark ? "#CBD5E0" : "#4A5568" }}
                      formatter={(value) => `(${value})`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className={`text-xs ${secondaryText} mt-2 text-center`}>
                Note: Funnel based on available visit data.
              </p>
            </div>
          </div>

          {/* Visits Table Section (Upcoming/Past) */}
          <div
            className={`${cardBg} ${borderColor} rounded-xl shadow-sm border md:col-span-6 lg:col-span-12`}
          >
            {/* Tabs and Filters */}
            <div className={`p-6 border-b ${borderColor}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTab("upcoming")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTab === "upcoming"
                        ? "bg-blue-600 text-white"
                        : isDark
                        ? "text-gray-400 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {" "}
                    Upcoming{" "}
                  </button>
                  <button
                    onClick={() => setSelectedTab("past")}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTab === "past"
                        ? "bg-blue-600 text-white"
                        : isDark
                        ? "text-gray-400 hover:bg-gray-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {" "}
                    Past Visits{" "}
                  </button>
                </div>
                {/* Search and Filter */}
                <div className="flex gap-2 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    {" "}
                    {/* Search Input */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {" "}
                      <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />{" "}
                    </div>{" "}
                    {/* Updated Search Icon Color */}
                    <input
                      type="text"
                      placeholder="Search visits..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-10 pr-4 py-2 rounded-lg w-full ${inputBg} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div className="relative">
                    {" "}
                    {/* Filter Button and Dropdown */}
                    <button
                      onClick={() => setFilterOpen(!filterOpen)}
                      className={`p-2 rounded-lg border ${
                        isDark
                          ? "bg-gray-700 border-gray-600 hover:bg-gray-600"
                          : "bg-gray-50 border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {" "}
                      <Filter className="h-5 w-5" />{" "}
                    </button>
                    {filterOpen && (
                      <div
                        className={`absolute right-0 mt-2 w-64 rounded-lg shadow-lg z-10 ${
                          isDark
                            ? "bg-gray-800 border border-gray-700"
                            : "bg-white border border-gray-200"
                        }`}
                      >
                        <div className="p-4">
                          <h4 className="font-medium mb-3">Filter Visits</h4>
                          <div className="mb-3">
                            <label className="block text-sm mb-1">Agent</label>
                            <select
                              value={selectedAgentFilter}
                              onChange={(e) =>
                                setSelectedAgentFilter(e.target.value)
                              }
                              className={`w-full p-2 rounded-lg border ${inputBg}`}
                            >
                              {/* 'availableAgents' list is already filtered for role 'agent' and includes "All Agents" */}
                              {availableAgents.map((agentObj) => (
                                <option
                                  key={agentObj.id}
                                  value={
                                    agentObj.id === "All Agents"
                                      ? "All Agents"
                                      : agentObj.id
                                  }
                                >
                                  {agentObj.name}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="mb-3">
                            <label className="block text-sm mb-1">
                              Property Type
                            </label>
                            <select
                              value={selectedPropertyTypeFilter}
                              onChange={(e) =>
                                setSelectedPropertyTypeFilter(e.target.value)
                              }
                              className={`w-full p-2 rounded-lg border ${inputBg}`}
                            >
                              {" "}
                              {availablePropertyTypes.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}{" "}
                            </select>
                          </div>
                          <div className="flex justify-end gap-2 mt-4">
                            <button
                              onClick={() => {
                                setSelectedAgentFilter("All Agents");
                                setSelectedPropertyTypeFilter("All Types");
                                setFilterOpen(false);
                              }}
                              className={`px-3 py-1.5 text-sm rounded-lg ${
                                isDark
                                  ? "text-gray-300 hover:bg-gray-700"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {" "}
                              Reset{" "}
                            </button>
                            <button
                              onClick={() => setFilterOpen(false)}
                              className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                              {" "}
                              Apply{" "}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Table Content */}
            <div className="overflow-x-auto">
              {selectedTab === "upcoming" ? (
                filteredUpcomingVisits.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className={`border-b ${borderColor}`}>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Date & Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Agent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${borderColor}`}>
                      {filteredUpcomingVisits.map((visit) => (
                        <tr
                          key={visit.id}
                          className={`${
                            isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                          } cursor-pointer transition-all duration-200 group border-l-4 border-transparent hover:border-blue-500`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium group-hover:text-blue-500 transition-colors duration-200">
                              {visit.property_details?.title || "N/A"}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span className="truncate max-w-[200px]">
                                {visit.property_details?.location || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>{getClientDisplayName(visit)}</div>
                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                              <Phone className="w-3 h-3 mr-1" />
                              <span>{getClientDisplayPhone(visit)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <CalendarDays className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                              <div>
                                <div>
                                  {moment(visit.date).format("MMM DD,YYYY")}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {visit.time}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {visit.agent_details?.full_name ||
                              visit.agent_details?.username ||
                              "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                visit.status === "confirmed"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                              }`}
                            >
                              {" "}
                              {visit.status.charAt(0).toUpperCase() +
                                visit.status.slice(1)}{" "}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => {
                                setSelectedVisitForEdit(visit);
                                setIsEditModalOpen(true);
                                setError(null);
                              }}
                              className={`${
                                isDark
                                  ? "text-blue-400 hover:text-blue-300"
                                  : "text-blue-600 hover:text-blue-800"
                              } font-medium text-sm flex items-center transition-all duration-200 hover:translate-x-1 hover:bg-blue-500/10 p-1 rounded`}
                            >
                              Details <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  // No upcoming visits
                  <div className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
                      <Calendar className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      No upcoming visits found
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      {searchQuery ||
                      selectedAgentFilter !== "All Agents" ||
                      selectedPropertyTypeFilter !== "All Types"
                        ? "Try adjusting your search or filter criteria"
                        : "Schedule a new visit to get started"}
                    </p>
                    <button
                      onClick={openAddModal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Schedule Visit
                    </button>
                  </div>
                )
              ) : // Past visits tab
              filteredPastVisits.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${borderColor}`}>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Feedback
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${borderColor}`}>
                    {filteredPastVisits.map((visit) => (
                      <tr
                        key={visit.id}
                        className={`${
                          isDark ? "hover:bg-gray-700/50" : "hover:bg-gray-50"
                        } cursor-pointer transition-all duration-200 group border-l-4 border-transparent hover:border-blue-500`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium group-hover:text-blue-500 transition-colors duration-200">
                            {visit.property_details?.title || "N/A"}
                          </div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="truncate max-w-[200px]">
                              {visit.property_details?.location || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>{getClientDisplayName(visit)}</div>
                          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                            <Phone className="w-3 h-3 mr-1" />
                            <span>{getClientDisplayPhone(visit)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CalendarDays className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                            <div>
                              <div>
                                {moment(visit.date).format("MMM DD,YYYY")}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {visit.time}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {visit.agent_details?.full_name ||
                            visit.agent_details?.username ||
                            "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              visit.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : visit.status === "cancelled" ||
                                  visit.status === "no_show"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {" "}
                            {visit.status.charAt(0).toUpperCase() +
                              visit.status.slice(1)}{" "}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p
                            className={`text-sm ${
                              isDark ? "text-gray-300" : "text-gray-600"
                            } line-clamp-2`}
                          >
                            {visit.feedback || "N/A"}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                // No past visits
                <div className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
                    <Calendar className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">
                    No past visits found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchQuery ||
                    selectedAgentFilter !== "All Agents" ||
                    selectedPropertyTypeFilter !== "All Types"
                      ? "Try adjusting your search or filter criteria"
                      : "Past visits will appear here"}
                  </p>
                </div>
              )}
            </div>
            {/* Pagination could be added here if needed */}
          </div>
        </div>
      </div>
      {/* FullCalendar Theming Styles */}
      <style jsx global>{`
        .fc .fc-button {
          padding: 0.4em 0.65em !important;
          font-size: 0.875rem !important;
          border-radius: 0.375rem !important;
          margin-left: 0.5em !important;
          margin-right: 0.5em !important;
        }
        .fc .fc-toolbar-chunk > :first-child {
          margin-left: 0 !important;
        }
        .fc .fc-toolbar-chunk > :last-child {
          margin-right: 0 !important;
        }
        .fc .fc-button-group .fc-button {
          /* Ensure buttons in a group also have some margin */
          margin-left: 0.5em !important;
          margin-right: 0.5em !important;
        }
        .fc .fc-button-primary {
          background-color: ${isDark ? "#374151" : "#E5E7EB"} !important;
          border-color: ${isDark ? "#4B5563" : "#D1D5DB"} !important;
          color: ${isDark ? "#D1D5DB" : "#374151"} !important;
        }
        .fc .fc-button-primary:hover:not(:disabled) {
          background-color: ${isDark ? "#4B5563" : "#D1D5DB"} !important;
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: #2563eb !important; /* Blue-600 */
          border-color: #1d4ed8 !important; /* Blue-700 */
          color: white !important;
        }
        .fc .fc-today-button:disabled {
          background-color: ${isDark ? "#374151" : "#E5E7EB"} !important;
          border-color: ${isDark ? "#4B5563" : "#D1D5DB"} !important;
          color: ${isDark ? "#9CA3AF" : "#6B7280"} !important;
          opacity: 0.7 !important;
        }
        .fc .fc-today-button:not(:disabled) {
          /* Today button style to match active */
          background-color: #2563eb !important;
          border-color: #1d4ed8 !important;
          color: white !important;
        }

        .fc .fc-toolbar-title {
          color: ${isDark ? "#F3F4F6" : "#1F2937"} !important;
          font-size: 1.25rem !important; /* Tailwind text-xl */
          margin-left: 0.5rem !important;
          margin-right: 0.5rem !important;
        }
        /* List View theming */
        .fc .fc-theme-standard .fc-list-day-cushion,
        .fc .fc-theme-standard .fc-list-table td {
          background-color: ${isDark
            ? "#1f2937"
            : "#ffffff"} !important; /* Match cardBg */
        }
        /* General border colors */
        .fc th,
        .fc td,
        .fc hr,
        .fc thead,
        .fc tbody,
        .fc-scrollgrid {
          border-color: ${borderColor} !important;
        }
        /* Day numbers in month view */
        .fc .fc-daygrid-day-number {
          color: ${isDark ? "#D1D5DB" : "#4B5563"} !important;
        }
        /* Today's date highlighting */
        .fc .fc-day-today {
          background-color: ${isDark
            ? "rgba(59, 130, 246, 0.2)"
            : "rgba(219, 234, 254, 0.7)"} !important; /* Light blue, slightly transparent */
        }
        /* Event text styling */
        .fc .fc-event {
          font-weight: 500 !important; /* Medium font weight */
        }
        /* Event links in list view */
        .fc .fc-list-event-title a {
          color: ${isDark
            ? "#93C5FD"
            : "#2563EB"} !important; /* Blue theme for links */
        }
        .fc .fc-list-event-dot {
          /* Use the event's border color for the dot, FullCalendar does this by default if not overridden */
          border-color: var(--fc-event-border-color, #000) !important;
        }

        /* Ensure dark mode class is applied to a high-level container if fc-dark is used by FullCalendar */
        .fullcalendar-themed-container.dark .fc-dark {
          /* Styles specific to FullCalendar when the main container has .dark */
        }
        .fullcalendar-themed-container:not(.dark) .fc-light {
          /* Styles specific to FullCalendar when the main container does not have .dark */
        }
      `}</style>
    </div>
  );
}

export default SiteVisits;
