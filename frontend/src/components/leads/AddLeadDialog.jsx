// src/components/leads/AddLeadDialog.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function AddLeadDialog({ isOpen, onClose, onSubmit, users = [] }) {
  // Default users to empty array
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("basic");

  // Initial form state
  const initialFormData = {
    name: "",
    email: "",
    phone: "",
    company: "",
    position: "",
    status: "New",
    source: "Website",
    interest: "",
    priority: "Medium",
    assignedToId: users[0]?.id || "", // Ensure it's a string if option values are strings, or handle type consistency
    budget: "",
    timeline: "",
    requirements: "",
    notes: "",
    tags: [],
  };

  const [formData, setFormData] = useState(initialFormData);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    // Reset form data when dialog opens, ensuring assignedToId is current
    if (isOpen) {
      setFormData({
        ...initialFormData,
        assignedToId: users[0]?.id || "", // Re-evaluate assignedToId based on current users
      });
      setActiveTab("basic"); // Reset to the first tab
      setTagInput(""); // Clear tag input
    }
  }, [isOpen, users]); // Rerun if users array changes while dialog might be open

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
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      // Optionally, show a more specific error to the user
      console.error("Form is invalid");
      return;
    }

    const assignedUserId = formData.assignedToId
      ? parseInt(formData.assignedToId, 10)
      : null;
    const assignedUser = users.find((user) => user.id === assignedUserId);

    // Prepare data for submission, ensuring assignedToId is a number if your backend expects it
    const submissionData = {
      ...formData,
      assignedToId: assignedUserId, // Send ID
      // The parent component (Leads.jsx) will derive assignedTo and assignedToAvatar from the ID
    };

    onSubmit(submissionData);
    // onClose(); // Typically, the parent component closes the dialog upon successful submission
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.email.trim() !== "" && // Basic email validation could be added here
      formData.phone.trim() !== ""
    );
  };

  if (!isOpen) return null;

  // Styles for input fields, can be refactored for DRYness
  const inputStyle = `w-full p-2 border rounded-md ${
    isDark
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
      : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
  }`;
  const labelStyle = `block text-sm font-medium ${
    isDark ? "text-gray-200" : "text-gray-700"
  }`;
  const tabButtonStyle = (tabName) =>
    `px-4 py-2 transition-colors duration-150 ${
      activeTab === tabName
        ? `border-b-2 ${
            isDark
              ? "border-blue-500 text-blue-400"
              : "border-blue-600 text-blue-600"
          } font-medium`
        : `${
            isDark
              ? "text-gray-400 hover:text-gray-200"
              : "text-gray-500 hover:text-gray-700"
          }`
    }`;

  return (
    <div className="fixed inset-0 bg-opacity-60 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div
        className={`${
          isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        } rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col`}
      >
        <div className="p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Add New Lead</h2>
            <button
              onClick={onClose}
              className={`p-1 rounded-full ${
                isDark
                  ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
              aria-label="Close dialog"
            >
              <X size={24} />
            </button>
          </div>
          <p
            className={`${
              isDark ? "text-gray-400" : "text-gray-500"
            } text-sm mt-1`}
          >
            Fill in the lead's information to add them to the system.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto">
          <div
            className={`px-6 pt-4 pb-2 border-b sticky top-0 ${
              isDark
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-white"
            }`}
          >
            <div className="flex">
              <button
                type="button"
                className={tabButtonStyle("basic")}
                onClick={() => setActiveTab("basic")}
              >
                Basic Info
              </button>
              <button
                type="button"
                className={tabButtonStyle("details")}
                onClick={() => setActiveTab("details")}
              >
                Lead Details
              </button>
              <button
                type="button"
                className={tabButtonStyle("additional")}
                onClick={() => setActiveTab("additional")}
              >
                Additional Info
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {activeTab === "basic" && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label htmlFor="name" className={labelStyle}>
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    placeholder="e.g., John Smith"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className={labelStyle}>
                      {" "}
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="e.g., john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className={labelStyle}>
                      {" "}
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="e.g., +1234567890"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="company" className={labelStyle}>
                      {" "}
                      Company{" "}
                    </label>
                    <input
                      id="company"
                      name="company"
                      placeholder="e.g., Acme Corp"
                      value={formData.company}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="position" className={labelStyle}>
                      {" "}
                      Position{" "}
                    </label>
                    <input
                      id="position"
                      name="position"
                      placeholder="e.g., Marketing Manager"
                      value={formData.position}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "details" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="status" className={labelStyle}>
                      {" "}
                      Status{" "}
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={(e) =>
                        handleSelectChange("status", e.target.value)
                      }
                      className={inputStyle}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Converted">Converted</option>
                      <option value="Dropped">Dropped</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="priority" className={labelStyle}>
                      {" "}
                      Priority{" "}
                    </label>
                    <select
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={(e) =>
                        handleSelectChange("priority", e.target.value)
                      }
                      className={inputStyle}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="source" className={labelStyle}>
                      {" "}
                      Lead Source{" "}
                    </label>
                    <select
                      id="source"
                      name="source"
                      value={formData.source}
                      onChange={(e) =>
                        handleSelectChange("source", e.target.value)
                      }
                      className={inputStyle}
                    >
                      <option value="Website">Website</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Referral">Referral</option>
                      <option value="Direct Call">Direct Call</option>
                      <option value="Email">Email</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="interest" className={labelStyle}>
                      {" "}
                      Interest{" "}
                    </label>
                    <input
                      id="interest"
                      name="interest"
                      placeholder="e.g., Specific property or service"
                      value={formData.interest}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="assignedToId" className={labelStyle}>
                    {" "}
                    Assign To{" "}
                  </label>
                  <select
                    id="assignedToId"
                    name="assignedToId"
                    value={formData.assignedToId}
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
                          (user.role.toLowerCase().includes("manager") ||
                            user.role.toLowerCase().includes("agent"))
                      )
                      .map((user) => (
                        <option key={user.id} value={user.id.toString()}>
                          {`${user.first_name || "User"} ${
                            user.last_name || ""
                          } (${user.role})`}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            )}

            {activeTab === "additional" && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="budget" className={labelStyle}>
                      {" "}
                      Budget{" "}
                    </label>
                    <input
                      id="budget"
                      name="budget"
                      placeholder="e.g., $50,000 - $70,000"
                      value={formData.budget}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label htmlFor="timeline" className={labelStyle}>
                      {" "}
                      Timeline{" "}
                    </label>
                    <input
                      id="timeline"
                      name="timeline"
                      placeholder="e.g., Next 3 months"
                      value={formData.timeline}
                      onChange={handleChange}
                      className={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="requirements" className={labelStyle}>
                    {" "}
                    Requirements{" "}
                  </label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    placeholder="Specific needs or preferences"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={3}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="notes" className={labelStyle}>
                    {" "}
                    Notes{" "}
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    placeholder="Any additional comments"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="tags-input" className={labelStyle}>
                    {" "}
                    Tags{" "}
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                          isDark
                            ? "bg-gray-600 text-gray-200"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className={`ml-1 rounded-full ${
                            isDark ? "hover:bg-gray-500" : "hover:bg-gray-300"
                          } p-0.5`}
                          aria-label={`Remove ${tag} tag`}
                        >
                          <X size={12} />
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
                    } mt-1`}
                  >
                    Press Enter to add a tag.
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>

        <div
          className={`p-6 border-t ${
            isDark ? "border-gray-700" : "border-gray-200"
          } flex justify-end gap-3`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-md text-sm font-medium border ${
              isDark
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Cancel
          </button>
          <button
            type="button" // Changed to button to prevent form submission, will be handled by parent form's onSubmit
            onClick={handleSubmit} // Manually trigger submit logic
            disabled={!isFormValid()}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
              isDark
                ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800"
                : "bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400"
            } ${!isFormValid() ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Create Lead
          </button>
        </div>
      </div>
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
    </div>
  );
}
