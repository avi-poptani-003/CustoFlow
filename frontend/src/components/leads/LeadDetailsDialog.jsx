// src/components/leads/LeadDetailsDialog.jsx
import { useState, useEffect } from "react";
import {
  Edit,
  Trash2,
  X,
  Save,
  Mail,
  Phone,
  Briefcase,
  DollarSign,
  Clock,
  Target,
  FileText,
  Tag,
  AlertCircle,
} from "lucide-react";
// Assuming ThemeContext is in src/context/ThemeContext.jsx
// Adjust the path if your ThemeContext is located elsewhere.
import { useTheme } from "../../context/ThemeContext";

export function LeadDetailsDialog({
  isOpen,
  onClose,
  lead,
  onUpdate,
  onDelete,
  users = [], // Default users to empty array
  canEdit,
  canDelete,
}) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Initialize formData with lead data or an empty structure if lead is null/undefined
  const initialFormState = {
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    status: "New",
    source: "Website",
    interest: "",
    priority: "Medium",
    assignedToId: "",
    budget: "",
    timeline: "",
    requirements: "",
    notes: "",
    tags: [],
    created: "",
    lastUpdated: "",
    lastActivity: "",
    // Include all fields that might be in a lead object
    ...lead,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (isOpen && lead) {
      // When dialog opens or lead changes, reset formData with the new lead data
      setFormData({
        ...initialFormState,
        ...lead,
        assignedToId: lead.assignedToId || "",
      });
      setIsEditing(false); // Reset editing state
      setActiveTab("overview"); // Reset to overview tab
      setTagInput(""); // Clear tag input
    } else if (!isOpen) {
      // Optionally reset when closing if needed, though usually covered by opening
      setFormData(initialFormState);
    }
  }, [isOpen, lead]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.warn("Invalid date string for formatting:", dateString);
      return dateString; // Fallback to original string if parsing fails
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags?.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...(prev.tags || []), newTag],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const handleSave = () => {
    // Prepare data for update, ensuring assignedToId is correctly formatted if needed
    const assignedUserId = formData.assignedToId
      ? parseInt(formData.assignedToId, 10)
      : null;
    const submissionData = {
      ...formData,
      id: lead.id, // Ensure the lead's ID is part of the submission
      assignedToId: assignedUserId,
    };
    onUpdate(submissionData);
    setIsEditing(false); // Exit editing mode on save
  };

  const handleDeleteConfirm = () => {
    onDelete(lead.id);
    setIsDeleteDialogOpen(false);
    onClose(); // Close the main dialog as well
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      New: isDark
        ? "bg-blue-900/50 text-blue-300 border border-blue-700"
        : "bg-blue-100 text-blue-800 border border-blue-300",
      Contacted: isDark
        ? "bg-purple-900/50 text-purple-300 border border-purple-700"
        : "bg-purple-100 text-purple-800 border border-purple-300",
      Qualified: isDark
        ? "bg-emerald-900/50 text-emerald-300 border border-emerald-700"
        : "bg-emerald-100 text-emerald-800 border border-emerald-300",
      Proposal: isDark
        ? "bg-amber-900/50 text-amber-300 border border-amber-700"
        : "bg-amber-100 text-amber-800 border border-amber-300",
      Negotiation: isDark
        ? "bg-orange-900/50 text-orange-300 border border-orange-700"
        : "bg-orange-100 text-orange-800 border border-orange-300",
      Converted: isDark
        ? "bg-green-900/50 text-green-300 border border-green-700"
        : "bg-green-100 text-green-800 border border-green-300",
      Dropped: isDark
        ? "bg-red-900/50 text-red-300 border border-red-700"
        : "bg-red-100 text-red-800 border border-red-300",
      "Site Visit Scheduled": isDark
        ? "bg-teal-900/50 text-teal-300 border border-teal-700"
        : "bg-teal-100 text-teal-800 border border-teal-300",
      "Site Visit Done": isDark
        ? "bg-cyan-900/50 text-cyan-300 border border-cyan-700"
        : "bg-cyan-100 text-cyan-800 border border-cyan-300",
      default: isDark
        ? "bg-gray-700/50 text-gray-300 border border-gray-500"
        : "bg-gray-100 text-gray-800 border border-gray-300",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          statusClasses[status] || statusClasses.default
        }`}
      >
        {status || "Unknown"}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityClasses = {
      Low: isDark
        ? "border-gray-600 text-gray-400"
        : "border-gray-300 text-gray-600",
      Medium: isDark
        ? "border-blue-700 text-blue-400"
        : "border-blue-400 text-blue-600",
      High: isDark
        ? "border-amber-600 text-amber-400"
        : "border-amber-400 text-amber-600",
      Urgent: isDark
        ? "border-red-600 text-red-400"
        : "border-red-400 text-red-600",
      default: isDark
        ? "border-gray-600 text-gray-400"
        : "border-gray-300 text-gray-600",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
          priorityClasses[priority] || priorityClasses.default
        }`}
      >
        {priority || "N/A"}
      </span>
    );
  };

  if (!isOpen || !lead) return null; // Ensure lead data is present

  const inputStyle = `w-full p-2 border rounded-md ${
    isDark
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
  }`;
  const labelStyle = `block text-sm font-medium mb-1 ${
    isDark ? "text-gray-300" : "text-gray-700"
  }`;
  const tabButtonStyle = (tabName) =>
    `px-4 py-2.5 transition-colors duration-150 text-sm font-medium ${
      activeTab === tabName
        ? `border-b-2 ${
            isDark
              ? "border-blue-500 text-blue-400"
              : "border-blue-600 text-blue-600"
          }`
        : `${
            isDark
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-500 hover:text-gray-700"
          }`
    }`;
  const detailItem = (icon, value, placeholder = "Not specified") => (
    <div className="flex items-center gap-2">
      {icon}
      <span className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
        {value || placeholder}
      </span>
    </div>
  );
  const detailItemGroup = (title, children) => (
    <div
      className={`border rounded-lg p-4 space-y-3 ${
        isDark
          ? "border-gray-700 bg-gray-800/30"
          : "border-gray-200 bg-gray-50/30"
      }`}
    >
      <h3
        className={`text-sm font-semibold ${
          isDark ? "text-gray-200" : "text-gray-800"
        }`}
      >
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-xl bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div
          className={`${
            isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
          } rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col`}
        >
          <div
            className={`p-5 border-b ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Lead Details: {formData.name}
              </h2>
              <div className="flex items-center gap-2">
                {canEdit && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs font-medium transition-colors ${
                      isDark
                        ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Edit size={14} /> Edit
                  </button>
                )}
                {isEditing && (
                  <>
                    <button
                      onClick={() => {
                        setFormData({
                          ...initialFormState,
                          ...lead,
                          assignedToId: lead.assignedToId || "",
                        });
                        setIsEditing(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-md text-xs font-medium transition-colors ${
                        isDark
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <X size={14} /> Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors ${
                        isDark
                          ? "bg-blue-600 hover:bg-blue-700"
                          : "bg-blue-500 hover:bg-blue-600"
                      }`}
                    >
                      <Save size={14} /> Save
                    </button>
                  </>
                )}
                {canDelete && !isEditing && (
                  <button
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-white transition-colors ${
                      isDark
                        ? "bg-red-700 hover:bg-red-800"
                        : "bg-red-600 hover:bg-red-700"
                    }`}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`p-1 rounded-full ${
                    isDark
                      ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                  aria-label="Close dialog"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
          </div>

          <div
            className={`px-5 pt-4 pb-2 border-b sticky top-0 ${
              isDark
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            } z-10`}
          >
            <div className="flex">
              <button
                type="button"
                className={tabButtonStyle("overview")}
                onClick={() => setActiveTab("overview")}
              >
                {" "}
                Overview{" "}
              </button>
              <button
                type="button"
                className={tabButtonStyle("details")}
                onClick={() => setActiveTab("details")}
              >
                {" "}
                Details{" "}
              </button>
              <button
                type="button"
                className={tabButtonStyle("notes")}
                onClick={() => setActiveTab("notes")}
              >
                {" "}
                Notes & Tags{" "}
              </button>
            </div>
          </div>

          <div className="p-5 space-y-6 flex-grow overflow-y-auto">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-fadeIn">
                <div className="md:col-span-1 space-y-5">
                  {detailItemGroup(
                    "Lead Profile",
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div
                        className={`w-20 h-20 ${
                          isDark
                            ? "bg-gray-700 text-gray-200"
                            : "bg-gray-200 text-gray-800"
                        } rounded-full flex items-center justify-center text-2xl font-bold mb-2 uppercase`}
                      >
                        {formData.name?.charAt(0) || "L"}
                      </div>
                      {isEditing ? (
                        <input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className={`${inputStyle} text-center font-semibold`}
                        />
                      ) : (
                        <h2 className="text-lg font-semibold">
                          {formData.name}
                        </h2>
                      )}
                      {isEditing ? (
                        <input
                          name="company"
                          value={formData.company || ""}
                          onChange={handleChange}
                          placeholder="Company"
                          className={`${inputStyle} text-center text-sm`}
                        />
                      ) : (
                        formData.company && (
                          <p
                            className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {formData.company}
                          </p>
                        )
                      )}
                      <div className="flex items-center gap-2 pt-2">
                        {" "}
                        {getStatusBadge(formData.status)}{" "}
                        {getPriorityBadge(formData.priority)}{" "}
                      </div>
                    </div>
                  )}
                  {detailItemGroup(
                    "Contact Information",
                    <div className="space-y-2.5">
                      {isEditing ? (
                        <input
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          type="email"
                          className={inputStyle}
                        />
                      ) : (
                        detailItem(
                          <Mail
                            size={14}
                            className={
                              isDark ? "text-gray-500" : "text-gray-400"
                            }
                          />,
                          formData.email
                        )
                      )}
                      {isEditing ? (
                        <input
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={inputStyle}
                        />
                      ) : (
                        detailItem(
                          <Phone
                            size={14}
                            className={
                              isDark ? "text-gray-500" : "text-gray-400"
                            }
                          />,
                          formData.phone
                        )
                      )}
                      {isEditing ? (
                        <input
                          name="position"
                          value={formData.position || ""}
                          onChange={handleChange}
                          placeholder="Position"
                          className={inputStyle}
                        />
                      ) : (
                        formData.position &&
                        detailItem(
                          <Briefcase
                            size={14}
                            className={
                              isDark ? "text-gray-500" : "text-gray-400"
                            }
                          />,
                          formData.position
                        )
                      )}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 space-y-5">
                  {detailItemGroup(
                    "Lead Summary",
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div>
                        {" "}
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Status
                        </p>{" "}
                        {isEditing ? (
                          <select
                            name="status"
                            value={formData.status}
                            onChange={(e) =>
                              handleSelectChange("status", e.target.value)
                            }
                            className={inputStyle}
                          >
                            {" "}
                            <option value="New">New</option>{" "}
                            <option value="Contacted">Contacted</option>{" "}
                            <option value="Site Visit Scheduled">
                              Site Visit Scheduled
                            </option>{" "}
                            <option value="Site Visit Done">
                              Site Visit Done
                            </option>{" "}
                            <option value="Qualified">Qualified</option>{" "}
                            <option value="Proposal">Proposal</option>{" "}
                            <option value="Negotiation">Negotiation</option>{" "}
                            <option value="Converted">Converted</option>{" "}
                            <option value="Dropped">Dropped</option>{" "}
                          </select>
                        ) : (
                          <p className="font-medium">
                            {getStatusBadge(formData.status)}
                          </p>
                        )}{" "}
                      </div>
                      <div>
                        {" "}
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Priority
                        </p>{" "}
                        {isEditing ? (
                          <select
                            name="priority"
                            value={formData.priority}
                            onChange={(e) =>
                              handleSelectChange("priority", e.target.value)
                            }
                            className={inputStyle}
                          >
                            {" "}
                            <option value="Low">Low</option>{" "}
                            <option value="Medium">Medium</option>{" "}
                            <option value="High">High</option>{" "}
                            <option value="Urgent">Urgent</option>{" "}
                          </select>
                        ) : (
                          <p className="font-medium">
                            {getPriorityBadge(formData.priority)}
                          </p>
                        )}{" "}
                      </div>
                      <div>
                        {" "}
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Source
                        </p>{" "}
                        {isEditing ? (
                          <select
                            name="source"
                            value={formData.source}
                            onChange={(e) =>
                              handleSelectChange("source", e.target.value)
                            }
                            className={inputStyle}
                          >
                            {" "}
                            <option value="Website">Website</option>{" "}
                            <option value="WhatsApp">WhatsApp</option>{" "}
                            <option value="Facebook">Facebook</option>{" "}
                            <option value="Referral">Referral</option>{" "}
                            <option value="Direct Call">Direct Call</option>{" "}
                            <option value="Email">Email</option>
                            <option value="Other">Other</option>{" "}
                          </select>
                        ) : (
                          <p
                            className={`font-medium ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {formData.source}
                          </p>
                        )}{" "}
                      </div>
                      <div>
                        {" "}
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Interest
                        </p>{" "}
                        {isEditing ? (
                          <input
                            name="interest"
                            value={formData.interest || ""}
                            onChange={handleChange}
                            className={inputStyle}
                          />
                        ) : (
                          <p
                            className={`font-medium ${
                              isDark ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {formData.interest || "N/A"}
                          </p>
                        )}{" "}
                      </div>
                      <div>
                        {" "}
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Assigned To
                        </p>
                        {isEditing ? (
                          <select
                            name="assignedToId"
                            value={formData.assignedToId || ""}
                            onChange={(e) =>
                              handleSelectChange("assignedToId", e.target.value)
                            }
                            className={inputStyle}
                          >
                            <option value="">Unassigned</option>
                            {users
                              .filter(
                                (user) =>
                                  user.role &&
                                  (user.role
                                    .toLowerCase()
                                    .includes("manager") ||
                                    user.role.toLowerCase().includes("agent"))
                              )
                              .map((user) => (
                                <option
                                  key={user.id}
                                  value={user.id.toString()}
                                >
                                  {`${user.first_name || "User"} ${
                                    user.last_name || ""
                                  } (${user.role})`}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            {formData.assignedToAvatar ? (
                              <img
                                src={formData.assignedToAvatar}
                                alt={formData.assignedTo || "Assignee"}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            ) : (
                              <div
                                className={`w-6 h-6 ${
                                  isDark
                                    ? "bg-gray-700 text-gray-200"
                                    : "bg-gray-200 text-gray-800"
                                } rounded-full flex items-center justify-center text-xs font-bold uppercase`}
                              >
                                {formData.assignedTo?.charAt(0) || "U"}
                              </div>
                            )}
                            <span
                              className={`font-medium ${
                                isDark ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {formData.assignedTo || "Unassigned"}
                            </span>
                          </div>
                        )}
                      </div>
                      <div>
                        {" "}
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Created
                        </p>{" "}
                        <p
                          className={`font-medium ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {formatDate(formData.created)}
                        </p>{" "}
                      </div>
                      <div>
                        {" "}
                        <p
                          className={`text-xs ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Last Updated
                        </p>{" "}
                        <p
                          className={`font-medium ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {formatDate(formData.lastUpdated)}
                        </p>{" "}
                      </div>
                    </div>
                  )}
                  {detailItemGroup(
                    "Last Activity",
                    isEditing ? (
                      <textarea
                        name="lastActivity"
                        value={formData.lastActivity || ""}
                        onChange={handleChange}
                        rows={2}
                        className={inputStyle}
                      />
                    ) : (
                      <p
                        className={`text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {formData.lastActivity || "No activity recorded"}
                      </p>
                    )
                  )}
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-5 animate-fadeIn">
                {detailItemGroup(
                  "Budget & Timeline",
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      {" "}
                      <label htmlFor="budget" className={labelStyle}>
                        Budget
                      </label>{" "}
                      {isEditing ? (
                        <input
                          id="budget"
                          name="budget"
                          value={formData.budget || ""}
                          onChange={handleChange}
                          placeholder="e.g., $50,000 - $70,000"
                          className={inputStyle}
                        />
                      ) : (
                        detailItem(
                          <DollarSign
                            size={14}
                            className={
                              isDark ? "text-gray-500" : "text-gray-400"
                            }
                          />,
                          formData.budget
                        )
                      )}{" "}
                    </div>
                    <div>
                      {" "}
                      <label htmlFor="timeline" className={labelStyle}>
                        Timeline
                      </label>{" "}
                      {isEditing ? (
                        <input
                          id="timeline"
                          name="timeline"
                          value={formData.timeline || ""}
                          onChange={handleChange}
                          placeholder="e.g., Next 3 months"
                          className={inputStyle}
                        />
                      ) : (
                        detailItem(
                          <Clock
                            size={14}
                            className={
                              isDark ? "text-gray-500" : "text-gray-400"
                            }
                          />,
                          formData.timeline
                        )
                      )}{" "}
                    </div>
                  </div>
                )}
                {detailItemGroup(
                  "Requirements",
                  isEditing ? (
                    <textarea
                      id="requirements"
                      name="requirements"
                      value={formData.requirements || ""}
                      onChange={handleChange}
                      placeholder="Specific needs or preferences"
                      rows={4}
                      className={inputStyle}
                    />
                  ) : (
                    <div className="flex items-start gap-2">
                      <Target
                        size={14}
                        className={`${
                          isDark ? "text-gray-500" : "text-gray-400"
                        } mt-1 flex-shrink-0`}
                      />
                      <p
                        className={`whitespace-pre-wrap text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {formData.requirements || "No requirements specified"}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-5 animate-fadeIn">
                {detailItemGroup(
                  "Notes",
                  isEditing ? (
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes || ""}
                      onChange={handleChange}
                      placeholder="Add notes about this lead"
                      rows={6}
                      className={inputStyle}
                    />
                  ) : (
                    <div className="flex items-start gap-2">
                      <FileText
                        size={14}
                        className={`${
                          isDark ? "text-gray-500" : "text-gray-400"
                        } mt-1 flex-shrink-0`}
                      />
                      <p
                        className={`whitespace-pre-wrap text-sm ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {formData.notes || "No notes added"}
                      </p>
                    </div>
                  )
                )}
                {detailItemGroup(
                  "Tags",
                  isEditing ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {formData.tags?.map((tag) => (
                          <span
                            key={tag}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                              isDark
                                ? "bg-gray-600 text-gray-200"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {" "}
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className={`ml-1 rounded-full ${
                                isDark
                                  ? "hover:bg-gray-500"
                                  : "hover:bg-gray-300"
                              } p-0.5`}
                              aria-label={`Remove ${tag} tag`}
                            >
                              {" "}
                              <X size={12} />{" "}
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        id="tags-input"
                        name="tags-input"
                        placeholder="Type a tag and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                        className={inputStyle}
                      />
                      <p
                        className={`text-xs ${
                          isDark ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Press Enter to add a tag.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <Tag
                        size={14}
                        className={`${
                          isDark ? "text-gray-500" : "text-gray-400"
                        } mt-1 flex-shrink-0`}
                      />
                      <div className="flex flex-wrap gap-2">
                        {formData.tags && formData.tags.length > 0 ? (
                          formData.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                isDark
                                  ? "bg-gray-700 text-gray-200"
                                  : "bg-gray-200 text-gray-800"
                              }`}
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span
                            className={`text-sm ${
                              isDark ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            No tags added
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
          <div
            className={`${
              isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
            } rounded-lg shadow-xl w-full max-w-md p-6`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`p-2 rounded-full ${
                  isDark ? "bg-red-900/30" : "bg-red-100"
                }`}
              >
                <AlertCircle
                  className={`h-6 w-6 ${
                    isDark ? "text-red-400" : "text-red-600"
                  }`}
                />
              </div>
              <h2 className="text-lg font-semibold">Confirm Deletion</h2>
            </div>
            <p
              className={`text-sm mb-6 ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to permanently delete the lead "
              <strong>{lead.name}</strong>"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium border ${
                  isDark
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                  isDark
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                Delete Lead
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
