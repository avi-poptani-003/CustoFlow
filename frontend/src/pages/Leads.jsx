// src/pages/Leads.jsx
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Plus,
  FileUp,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Globe,
  Phone,
  Facebook,
  MessageCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  Mail,
} from "lucide-react";
import { toast } from "react-toastify";

import LeadService from "../services/leadService";
import UserService from "../services/UserService";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";

import LoadingSpinner from "../components/common/LoadingSpinner";
import ErrorMessage from "../components/common/ErrorMessage";
import { useUserRole } from "../components/leads/useUserRole";
import { AddLeadDialog } from "../components/leads/AddLeadDialog";
import { ImportLeadsDialog } from "../components/leads/ImportLeadsDialog";
import { LeadDetailsDialog } from "../components/leads/LeadDetailsDialog";

// Debounce function
function debounce(func, delay) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, delay);
  };
}

function Leads() {
  const { theme } = useTheme();
  const auth = useAuth();
  const { user, isAdmin, isManager, isAgent } = auth;

  const { hasPermission } = useUserRole();
  const isDark = theme === "dark";

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [assigneeFilter, setAssigneeFilter] = useState("All Assignees");

  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [leads, setLeads] = useState([]);
  const [usersStateInternal, setUsersStateInternal] = useState([]); // Correctly declared
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalLeads, setTotalLeads] = useState(0);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const leadSources = [
    "Website",
    "WhatsApp",
    "Facebook",
    "Referral",
    "Direct Call",
    "Email",
    "Exhibition",
    "Other",
  ].sort();
  const leadStatuses = [
    "New",
    "Contacted",
    "Site Visit Scheduled",
    "Site Visit Done",
    "Qualified",
    "Proposal",
    "Negotiation",
    "Converted",
    "Dropped",
  ].sort();

  const debouncedSetSearchQuery = useCallback(
    debounce((query) => {
      setSearchQuery(query);
      setCurrentPage(1);
    }, 500),
    []
  );

  useEffect(() => {
    debouncedSetSearchQuery(searchInput);
  }, [searchInput, debouncedSetSearchQuery]);

  const isCurrentUserPureAgent =
    user && isAgent() && !isManager() && !isAdmin();

  useEffect(() => {
    if (isCurrentUserPureAgent && user?.id) {
      if (assigneeFilter !== user.id.toString()) {
        setAssigneeFilter(user.id.toString());
      }
    }
  }, [user, isCurrentUserPureAgent, assigneeFilter]);

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        // Fetch users only if not a pure agent, or if needed for other reasons
        // Pure agents might not need the full list if UI is adapted.
        // However, AddLeadDialog/LeadDetailsDialog might still expect it.
        // For now, fetching for all roles that can access this page.
        const usersResponse = await UserService.getUsers();
        setUsersStateInternal(usersResponse.results || usersResponse || []); // Correctly set

        const params = {
          page: currentPage,
          page_size: pageSize,
          ...(searchQuery && { search: searchQuery }),
          ...(statusFilter !== "All Statuses" && { status: statusFilter }),
          ...(sourceFilter !== "All Sources" && { source: sourceFilter }),
        };

        if (isCurrentUserPureAgent) {
          params.assigned_to = user.id;
        } else if (isManager() && !isAdmin()) {
          if (assigneeFilter !== "All Assignees") {
            params.assigned_to = assigneeFilter;
          }
        } else if (isAdmin()) {
          if (assigneeFilter !== "All Assignees") {
            params.assigned_to = assigneeFilter;
          }
        } else {
          if (assigneeFilter !== "All Assignees") {
            params.assigned_to = assigneeFilter;
          }
        }

        const leadsResponse = await LeadService.getLeads(params);

        const currentUsersForMapping =
          usersResponse.results || usersResponse || [];
        const transformedLeads = leadsResponse.results.map((lead) => {
          const assignedUser = currentUsersForMapping.find(
            (u) => u.id === lead.assigned_to
          );
          return {
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            company: lead.company || "",
            position: lead.position || "",
            status: lead.status,
            source: lead.source,
            interest: lead.interest || "",
            priority: lead.priority,
            assignedTo: assignedUser
              ? `${assignedUser.first_name || ""} ${
                  assignedUser.last_name || ""
                }`.trim()
              : "Unassigned",
            assignedToId: lead.assigned_to || null,
            assignedToAvatar: assignedUser?.profile_image || null,
            budget: lead.budget || "",
            timeline: lead.timeline || "",
            requirements: lead.requirements || "",
            notes: lead.notes || "",
            tags: Array.isArray(lead.tags)
              ? lead.tags
              : lead.tags
              ? String(lead.tags)
                  .split(",")
                  .map((t) => t.trim())
              : [],
            created: lead.created_at,
            lastUpdated: lead.updated_at,
            lastActivity: lead.last_activity || "No activity recorded",
          };
        });

        setLeads(transformedLeads);
        setTotalLeads(leadsResponse.count);
        setTotalPages(Math.ceil(leadsResponse.count / pageSize) || 1);
      } catch (err) {
        console.error("Error loading data:", err);
        const errorMessage =
          err.response?.data?.detail ||
          err.message ||
          "Failed to load data. Please try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    user,
    isAdmin,
    isManager,
    isAgent,
    isCurrentUserPureAgent,
    currentPage,
    pageSize,
    refreshTrigger,
    searchQuery,
    statusFilter,
    sourceFilter,
    assigneeFilter,
  ]);

  const handleAddLead = async (leadDataFromDialog) => {
    const submissionData = {
      ...leadDataFromDialog,
      assigned_to: leadDataFromDialog.assignedToId || null,
    };
    delete submissionData.assignedToId;
    delete submissionData.assignedTo;
    delete submissionData.assignedToAvatar;

    try {
      await LeadService.createLead(submissionData);
      setIsAddLeadModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
      toast.success("Lead created successfully!");
    } catch (err) {
      console.error("Error creating lead:", err);
      const errorMsg = err.response?.data?.detail || "Failed to create lead.";
      if (err.response?.data && typeof err.response.data === "object") {
        const messages = Object.entries(err.response.data)
          .map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
          )
          .join("; ");
        toast.error(`Creation failed: ${messages}`);
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleUpdateLead = async (leadDataFromDialog) => {
    const submissionData = {
      ...leadDataFromDialog,
      assigned_to: leadDataFromDialog.assignedToId || null,
    };
    delete submissionData.assignedToId;
    delete submissionData.assignedTo;
    delete submissionData.assignedToAvatar;

    if (!submissionData.id && selectedLead) submissionData.id = selectedLead.id;

    try {
      await LeadService.updateLead(submissionData.id, submissionData);
      setIsDetailsModalOpen(false);
      setSelectedLead(null);
      setRefreshTrigger((prev) => prev + 1);
      toast.success("Lead updated successfully!");
    } catch (err) {
      console.error("Error updating lead:", err);
      const errorMsg = err.response?.data?.detail || "Failed to update lead.";
      if (err.response?.data && typeof err.response.data === "object") {
        const messages = Object.entries(err.response.data)
          .map(
            ([key, value]) =>
              `${key}: ${Array.isArray(value) ? value.join(", ") : value}`
          )
          .join("; ");
        toast.error(`Update failed: ${messages}`);
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const handleDeleteLead = async (leadId) => {
    try {
      await LeadService.deleteLead(leadId);
      if (leads.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        setRefreshTrigger((prev) => prev + 1);
      }
      toast.success("Lead deleted successfully.");
      setIsDetailsModalOpen(false);
      setSelectedLead(null);
    } catch (err) {
      console.error("Error deleting lead:", err);
      toast.error(err.response?.data?.detail || "Failed to delete lead.");
    }
  };

  const handleImportLeads = async (file) => {
    if (!file) {
      toast.error("No file selected for import.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await LeadService.importLeads(formData);
      setIsImportModalOpen(false);
      setRefreshTrigger((prev) => prev + 1);
      toast.success(response.message || "Leads imported successfully!");
    } catch (err) {
      console.error("Error importing leads:", err);
      toast.error(
        err.response?.data?.error ||
          err.response?.data?.detail ||
          "Failed to import leads."
      );
    }
  };

  const handleExportLeads = async () => {
    try {
      const filters = {
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== "All Statuses" && { status: statusFilter }),
        ...(sourceFilter !== "All Sources" && { source: sourceFilter }),
      };

      if (isCurrentUserPureAgent && user?.id) {
        filters.assigned_to = user.id;
      } else if (assigneeFilter !== "All Assignees") {
        filters.assigned_to = assigneeFilter;
      }

      const blob = await LeadService.exportLeads(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `leads_export_${new Date().toISOString().split("T")[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Leads exported successfully.");
    } catch (err) {
      console.error("Error exporting leads:", err);
      toast.error(err.response?.data?.detail || "Failed to export leads.");
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      New: isDark
        ? "bg-blue-900/50 text-blue-300 border-blue-700"
        : "bg-blue-100 text-blue-700 border-blue-300",
      Contacted: isDark
        ? "bg-purple-900/50 text-purple-300 border-purple-700"
        : "bg-purple-100 text-purple-700 border-purple-300",
      "Site Visit Scheduled": isDark
        ? "bg-teal-900/50 text-teal-300 border-teal-700"
        : "bg-teal-100 text-teal-700 border-teal-300",
      "Site Visit Done": isDark
        ? "bg-cyan-900/50 text-cyan-300 border-cyan-700"
        : "bg-cyan-100 text-cyan-700 border-cyan-300",
      Qualified: isDark
        ? "bg-emerald-900/50 text-emerald-300 border-emerald-700"
        : "bg-emerald-100 text-emerald-700 border-emerald-300",
      Proposal: isDark
        ? "bg-amber-900/50 text-amber-300 border-amber-700"
        : "bg-amber-100 text-amber-700 border-amber-300",
      Negotiation: isDark
        ? "bg-orange-900/50 text-orange-300 border-orange-700"
        : "bg-orange-100 text-orange-700 border-orange-300",
      Converted: isDark
        ? "bg-green-900/50 text-green-300 border-green-700"
        : "bg-green-100 text-green-700 border-green-300",
      Dropped: isDark
        ? "bg-red-900/50 text-red-300 border-red-700"
        : "bg-red-100 text-red-700 border-red-300",
      default: isDark
        ? "bg-gray-700/50 text-gray-300 border-gray-500"
        : "bg-gray-200 text-gray-700 border-gray-400",
    };
    return `px-2 py-0.5 sm:px-2.5 text-[10px] sm:text-xs font-semibold rounded-full border ${
      classes[status] || classes.default
    }`;
  };

  const getSourceIcon = (source) => {
    const iconProps = { size: 14, className: "mr-1 sm:mr-1.5 flex-shrink-0" };
    switch (source?.toLowerCase()) {
      case "website":
        return (
          <Globe
            {...iconProps}
            className={`${isDark ? "text-blue-400" : "text-blue-600"} ${
              iconProps.className
            }`}
          />
        );
      case "whatsapp":
        return (
          <MessageCircle
            {...iconProps}
            className={`${isDark ? "text-green-400" : "text-green-500"} ${
              iconProps.className
            }`}
          />
        );
      case "facebook":
        return (
          <Facebook
            {...iconProps}
            className={`${isDark ? "text-sky-400" : "text-sky-600"} ${
              iconProps.className
            }`}
          />
        );
      case "referral":
        return (
          <Users
            {...iconProps}
            className={`${isDark ? "text-orange-400" : "text-orange-500"} ${
              iconProps.className
            }`}
          />
        );
      case "direct call":
        return (
          <Phone
            {...iconProps}
            className={`${isDark ? "text-lime-400" : "text-lime-600"} ${
              iconProps.className
            }`}
          />
        );
      case "email":
        return (
          <Mail
            {...iconProps}
            className={`${isDark ? "text-yellow-400" : "text-yellow-500"} ${
              iconProps.className
            }`}
          />
        );
      default:
        return (
          <div
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
              isDark ? "bg-gray-500" : "bg-gray-400"
            } ${iconProps.className}`}
          ></div>
        );
    }
  };

  const handleViewLeadDetails = (lead) => {
    setSelectedLead(lead);
    setIsDetailsModalOpen(true);
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  const thStyle = `px-2 py-2 sm:px-3 sm:py-3 text-left text-[10px] sm:text-xs font-medium uppercase tracking-wider ${
    isDark ? "text-gray-400 bg-gray-700/50" : "text-gray-500 bg-gray-50"
  }`;
  const tdStyle = `px-2 py-2 sm:px-3 sm:py-3 text-xs sm:text-sm ${
    isDark ? "text-gray-300" : "text-gray-700"
  }`;
  const buttonStyle = `px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all duration-150 flex items-center gap-1 sm:gap-1.5 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed`;
  const filterSelectStyle = `w-full px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-md border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDark
      ? "bg-gray-700 border-gray-600 text-gray-100"
      : "bg-white border-gray-300 text-gray-900"
  }`;

  const paginationButtonBaseClass = `py-1 sm:py-1.5 text-[10px] sm:text-xs font-medium flex items-center justify-center rounded-md focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-colors`;
  const paginationButtonThemeClass = isDark
    ? `bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed`
    : `bg-white border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`;

  return (
    <div
      className={`min-h-screen p-2 sm:p-4 md:p-6 lg:p-8 ${
        isDark ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <header className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="min-w-0">
            <h1
              className={`text-lg sm:text-xl md:text-2xl font-bold ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Lead Management
            </h1>
            <p
              className={`text-xs sm:text-sm mt-0.5 sm:mt-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              View, filter, and manage all your leads in one place.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            {hasPermission("create_leads") && (
              <button
                type="button"
                onClick={() => setIsAddLeadModalOpen(true)}
                disabled={loading}
                className={`${buttonStyle} ${
                  isDark
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                <Plus size={14} /> Add Lead
              </button>
            )}
            {hasPermission("import_leads") && (
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                disabled={loading}
                className={`${buttonStyle} ${
                  isDark
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                <FileUp size={14} /> Import
              </button>
            )}
            {hasPermission("export_leads") && (
              <button
                type="button"
                onClick={handleExportLeads}
                disabled={loading || leads.length === 0}
                className={`${buttonStyle} ${
                  isDark
                    ? "bg-purple-600 hover:bg-purple-700 text-white"
                    : "bg-purple-500 hover:bg-purple-600 text-white"
                }`}
              >
                <Download size={14} /> Export
              </button>
            )}
          </div>
        </div>
      </header>

      <div
        className={`mb-4 sm:mb-5 p-3 sm:p-4 rounded-lg shadow border relative ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-3 sm:gap-x-4 gap-y-2 sm:gap-y-3 items-end">
          <div className="sm:col-span-2 lg:col-span-2">
            <label
              htmlFor="searchLeads"
              className={`block text-[11px] sm:text-xs font-medium mb-0.5 sm:mb-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2.5 sm:pl-3 flex items-center pointer-events-none">
                <Search
                  size={14}
                  className={isDark ? "text-gray-400" : "text-gray-500"}
                />
              </div>
              <input
                type="text"
                id="searchLeads"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Name, email, phone..."
                className={`w-full pl-8 sm:pl-9 pr-2.5 sm:pr-3 py-1.5 sm:py-2 rounded-md border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-100"
                    : "bg-white border-gray-300 text-gray-900"
                }`}
              />
            </div>
          </div>
          <div className="sm:col-span-1 lg:col-span-1">
            <label
              htmlFor="statusFilter"
              className={`block text-[11px] sm:text-xs font-medium mb-0.5 sm:mb-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Status
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={filterSelectStyle}
            >
              <option value="All Statuses">All Statuses</option>
              {leadStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-1 lg:col-span-1">
            <label
              htmlFor="sourceFilter"
              className={`block text-[11px] sm:text-xs font-medium mb-0.5 sm:mb-1 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Source
            </label>
            <select
              id="sourceFilter"
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={filterSelectStyle}
            >
              <option value="All Sources">All Sources</option>
              {leadSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-end gap-2">
              <div className="flex-grow min-w-0">
                <label
                  htmlFor="assigneeFilter"
                  className={`block text-[11px] sm:text-xs font-medium mb-0.5 sm:mb-1 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Assignee
                </label>
                <select
                  id="assigneeFilter"
                  value={assigneeFilter}
                  onChange={(e) => {
                    if (!isCurrentUserPureAgent) {
                      setAssigneeFilter(e.target.value);
                      setCurrentPage(1);
                    }
                  }}
                  className={filterSelectStyle}
                  disabled={
                    usersStateInternal.length === 0 ||
                    (isCurrentUserPureAgent && !!user)
                  }
                >
                  {isCurrentUserPureAgent && user ? (
                    <option value={user.id.toString()}>
                      {`${user.first_name || "My"} ${
                        user.last_name || "Leads"
                      }`.trim()}
                    </option>
                  ) : (
                    <>
                      <option value="All Assignees">All Assignees</option>
                      {usersStateInternal
                        .filter(
                          (u) =>
                            u &&
                            u.role &&
                            (u.role.toLowerCase().includes("manager") ||
                              u.role.toLowerCase().includes("agent") ||
                              u.role.toLowerCase().includes("admin"))
                        )
                        .map((u) => (
                          <option key={u.id} value={u.id.toString()}>
                            {`${u.first_name || "User"} ${
                              u.last_name || ""
                            }`.trim() || `User ID: ${u.id}`}
                          </option>
                        ))}
                    </>
                  )}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setRefreshTrigger((prev) => prev + 1)}
                disabled={loading}
                className={`p-2 sm:p-2.5 rounded-md border focus:outline-none focus:ring-2 focus:ring-blue-500 self-end flex-shrink-0 ${
                  isDark
                    ? "bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
                title="Refresh Leads"
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </div>
        {loading && leads.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5">
            <div
              className={`h-full w-full ${
                isDark ? "bg-blue-500/30" : "bg-blue-500/20"
              } overflow-hidden`}
            >
              <div
                className={`h-full ${
                  isDark ? "bg-blue-500" : "bg-blue-500"
                } animate-indeterminate-progress`}
              ></div>
            </div>
          </div>
        )}
      </div>

      <div
        className={`rounded-lg shadow border overflow-hidden ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        {loading && leads.length === 0 && <LoadingSpinner size="lg" />}
        {error && !loading && (
          <ErrorMessage
            error={error}
            onRetry={() => setRefreshTrigger((prev) => prev + 1)}
          />
        )}
        {!loading && leads.length === 0 && !error && (
          <div
            className={`p-6 sm:p-8 text-center ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No leads found.{" "}
            {hasPermission("create_leads") && (
              <button
                type="button"
                onClick={() => setIsAddLeadModalOpen(true)}
                className={`ml-1 underline ${
                  isDark
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-500"
                }`}
              >
                Create one?
              </button>
            )}
          </div>
        )}

        {leads.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] sm:min-w-[768px] md:min-w-[900px]">
              <thead>
                <tr>
                  <th className={thStyle}>Lead</th>
                  <th className={`${thStyle} hidden sm:table-cell`}>Contact</th>
                  <th className={thStyle}>Status</th>
                  <th className={`${thStyle} hidden md:table-cell`}>Source</th>
                  <th className={`${thStyle} hidden lg:table-cell`}>
                    Interest
                  </th>
                  <th className={`${thStyle} hidden lg:table-cell`}>
                    Assigned
                  </th>
                  <th className={`${thStyle} hidden xl:table-cell`}>Created</th>
                  <th className={`${thStyle} text-center`}>Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? "divide-gray-700/50" : "divide-gray-200"
                }`}
              >
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`${
                      isDark ? "hover:bg-gray-700/40" : "hover:bg-gray-50/70"
                    } transition-colors duration-150`}
                  >
                    <td className={tdStyle}>
                      <div
                        className="font-medium text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs"
                        title={lead.name}
                      >
                        {lead.name || "N/A"}
                      </div>
                      {lead.company && (
                        <div
                          className={`text-[10px] sm:text-xs truncate max-w-[150px] sm:max-w-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                          title={lead.company}
                        >
                          {lead.company}
                        </div>
                      )}
                    </td>
                    <td className={`${tdStyle} hidden sm:table-cell`}>
                      <div
                        className="text-[10px] sm:text-xs truncate max-w-[150px] sm:max-w-xs"
                        title={lead.email}
                      >
                        {lead.email || "N/A"}
                      </div>
                      <div
                        className={`text-[10px] sm:text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {lead.phone || "N/A"}
                      </div>
                    </td>
                    <td className={tdStyle}>
                      <span className={getStatusBadgeClass(lead.status)}>
                        {lead.status}
                      </span>
                    </td>
                    <td className={`${tdStyle} hidden md:table-cell`}>
                      <div className="flex items-center text-[10px] sm:text-xs">
                        {getSourceIcon(lead.source)} {lead.source}
                      </div>
                    </td>
                    <td
                      className={`${tdStyle} max-w-[100px] sm:max-w-[150px] truncate hidden lg:table-cell`}
                      title={lead.interest}
                    >
                      {lead.interest || "N/A"}
                    </td>
                    <td className={`${tdStyle} hidden lg:table-cell`}>
                      <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs">
                        {lead.assignedToAvatar ? (
                          <img
                            src={lead.assignedToAvatar}
                            alt={lead.assignedTo}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <div
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              isDark ? "bg-gray-600" : "bg-gray-300"
                            } rounded-full flex items-center justify-center text-[10px] font-bold uppercase`}
                          >
                            {lead.assignedTo?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                        )}
                        <span
                          className="truncate max-w-[100px]"
                          title={lead.assignedTo}
                        >
                          {lead.assignedTo}
                        </span>
                      </div>
                    </td>
                    <td className={`${tdStyle} hidden xl:table-cell`}>
                      {formatDateForDisplay(lead.created)}
                    </td>
                    <td className={`${tdStyle} text-center`}>
                      <div className="flex justify-center items-center gap-0.5 sm:gap-1">
                        <button
                          type="button"
                          onClick={() => handleViewLeadDetails(lead)}
                          className={`p-0.5 sm:p-1 rounded-md ${
                            isDark
                              ? "text-blue-400 hover:bg-blue-900/40"
                              : "text-blue-600 hover:bg-blue-100"
                          }`}
                          title="View/Edit Lead"
                        >
                          <Edit size={12} />
                        </button>
                        {hasPermission("delete_leads") && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLead(lead);
                              setIsDetailsModalOpen(true); // Delete confirmation can be inside details modal
                            }}
                            className={`p-0.5 sm:p-1 rounded-md ${
                              isDark
                                ? "text-red-400 hover:bg-red-900/40"
                                : "text-red-500 hover:bg-red-100"
                            }`}
                            title="Delete Lead"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalLeads > 0 && !error && leads.length > 0 && (
          <div
            className={`px-2 sm:px-4 py-2 sm:py-3 border-t ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
              <div
                className={`text-[10px] sm:text-xs ${
                  isDark ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Showing{" "}
                <span className="font-medium">
                  {Math.min((currentPage - 1) * pageSize + 1, totalLeads)}
                </span>
                -
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalLeads)}
                </span>{" "}
                of <span className="font-medium">{totalLeads}</span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={`px-1.5 sm:px-2 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-md border focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 ${
                    isDark
                      ? "bg-gray-700 border-gray-600 text-gray-200"
                      : "bg-white border-gray-300 text-gray-700"
                  }`}
                >
                  {[10, 25, 50].map((size) => (
                    <option key={size} value={size}>
                      {size}/page
                    </option>
                  ))}
                </select>
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1 || totalPages === 0}
                    className={`${paginationButtonBaseClass} ${paginationButtonThemeClass} px-2 sm:px-2.5`}
                    title="First"
                  >
                    First
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1 || totalPages === 0}
                    className={`${paginationButtonBaseClass} ${paginationButtonThemeClass} px-2 sm:px-2`}
                    title="Previous"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span
                    className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs rounded-md mx-0.5 ${
                      isDark
                        ? "text-gray-300 border border-gray-600 bg-gray-700"
                        : "text-gray-700 border border-gray-300 bg-gray-50"
                    }`}
                  >
                    {currentPage} / {totalPages || 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage(Math.min(currentPage + 1, totalPages || 1))
                    }
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`${paginationButtonBaseClass} ${paginationButtonThemeClass} px-2 sm:px-2`}
                    title="Next"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages || 1)}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className={`${paginationButtonBaseClass} ${paginationButtonThemeClass} px-2 sm:px-2.5`}
                    title="Last"
                  >
                    Last
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ensure usersStateInternal is passed as 'users' prop */}
      {isAddLeadModalOpen && (
        <AddLeadDialog
          isOpen={isAddLeadModalOpen}
          onClose={() => setIsAddLeadModalOpen(false)}
          onSubmit={handleAddLead}
          users={usersStateInternal} /* Corrected: Pass usersStateInternal */
        />
      )}
      {isImportModalOpen && (
        <ImportLeadsDialog
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportLeads}
        />
      )}
      {selectedLead && isDetailsModalOpen && (
        <LeadDetailsDialog
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedLead(null);
          }}
          lead={selectedLead}
          onUpdate={handleUpdateLead}
          onDelete={handleDeleteLead}
          users={usersStateInternal} /* Corrected: Pass usersStateInternal */
          canEdit={hasPermission("edit_leads")}
          canDelete={hasPermission("delete_leads")}
        />
      )}
      <style>
        {`
          .animate-indeterminate-progress { animation: indeterminate-progress 1.5s infinite linear; }
          @keyframes indeterminate-progress { 
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); } 
          }
        `}
      </style>
    </div>
  );
}

export default Leads;
