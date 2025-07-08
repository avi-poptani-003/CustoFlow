import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import authService from "../services/authService";
import {
  User,
  Mail,
  Search,
  Trash2,
  Users,
  X,
  AlertTriangle,
} from "lucide-react"; // Added icons

function TeamManagement() {
  const [users, setUsers] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    role: "agent",
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const { user: currentUser } = useAuth(); // Renamed to avoid conflict
  const { appliedTheme } = useTheme(); // Use appliedTheme for consistency
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const isDark = appliedTheme === "dark"; // Use appliedTheme

  useEffect(() => {
    if (currentUser?.role === "admin") {
      fetchUsers();
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const data = await authService.getApiInstance().get("/users/");
      setUsers(data.data); // Assume data.data is an array of user objects with profile_image
    } catch (error) {
      console.error("Error fetching users:", error);
      setError("Failed to load team members. Please try again later.");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password_confirm) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setSuccessMessage("");
    try {
      await authService.getApiInstance().post("/users/", formData);
      setSuccessMessage("User created successfully!");
      setShowCreateModal(false);
      fetchUsers();
      setFormData({
        username: "",
        email: "",
        password: "",
        password_confirm: "",
        first_name: "",
        last_name: "",
        phone_number: "",
        role: "agent",
      });
    } catch (err) {
      if (err.response?.data) {
        // Handle specific backend errors
        const errors = err.response.data;
        if (errors.username)
          setError(`Username: ${errors.username.join(", ")}`);
        else if (errors.email) setError(`Email: ${errors.email.join(", ")}`);
        else if (errors.detail) setError(errors.detail);
        else
          setError(
            "Error creating user. Please check the details and try again."
          );
      } else {
        setError("Error creating user. Please try again.");
      }
    }
  };

  const handleDeleteClick = (userToDeleteData) => {
    // Renamed parameter
    setUserToDelete(userToDeleteData);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    setError("");
    setSuccessMessage("");
    try {
      await authService
        .getApiInstance()
        .delete(`/auth/user/${userToDelete.id}/`);
      setSuccessMessage("User deleted successfully!");
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Error deleting user. Please try again."
      );
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  if (currentUser?.role !== "admin") {
    return (
      <div className={`p-4 ${isDark ? "text-white" : "text-gray-800"}`}>
        You don't have permission to access this page.
      </div>
    );
  }

  const filteredUsers = users.filter((userItem) => {
    // Exclude clients or any other undesired roles
    const allowedRoles = ["admin", "manager", "agent"];
    if (!userItem.role || !allowedRoles.includes(userItem.role.toLowerCase())) {
      return false;
    }

    const searchMatch =
      (userItem.first_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (userItem.last_name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (userItem.username || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (userItem.email || "").toLowerCase().includes(searchTerm.toLowerCase());

    const roleMatch =
      roleFilter === "All" ||
      (userItem.role || "").toLowerCase() === roleFilter.toLowerCase();

    return searchMatch && roleMatch;
  });

  const getInitials = (firstName, lastName) => {
    return `${(firstName || "").charAt(0)}${(lastName || "").charAt(
      0
    )}`.toUpperCase();
  };

  const getRoleColor = (role) => {
    switch ((role || "").toLowerCase()) {
      case "admin":
        return isDark
          ? "bg-purple-900 text-purple-200 border-purple-700"
          : "bg-purple-100 text-purple-800 border-purple-200";
      case "manager":
        return isDark
          ? "bg-blue-900 text-blue-200 border-blue-700"
          : "bg-blue-100 text-blue-800 border-blue-200";
      case "agent":
        return isDark
          ? "bg-green-900 text-green-200 border-green-700"
          : "bg-green-100 text-green-800 border-green-200";
      default:
        return isDark
          ? "bg-gray-700 text-gray-300 border-gray-600"
          : "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleDisplayName = (role) => {
    const r = role || "";
    switch (r.toLowerCase()) {
      case "manager":
        return "Manager";
      case "agent":
        return "Agent";
      case "admin":
        return "Administrator";
      default:
        return r ? r.charAt(0).toUpperCase() + r.slice(1) : "N/A";
    }
  };

  return (
    <div
      className={`p-6 min-h-screen ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1
          className={`text-3xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          Team Management
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
        >
          <User size={18} /> Create New User
        </button>
      </div>

      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search team members..."
            className={`w-full pl-12 pr-4 py-3 border rounded-lg shadow-sm transition-colors ${
              isDark
                ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500"
                : "bg-white border-gray-300 text-gray-800 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <Search size={20} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-sm font-medium ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Filter by role:
          </span>
          <div className="flex space-x-2">
            {["All", "Manager", "Agent", "Admin"].map(
              (
                role // Added Admin
              ) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                    roleFilter === role
                      ? "bg-blue-600 text-white"
                      : isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {role === "Admin" ? "Administrator" : role}
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-600" />
          {error}
        </div>
      )}
      {successMessage && (
        <div className="mb-6 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}

      {/* Team Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.length > 0 ? (
          filteredUsers.map(
            (
              member // Renamed to member for clarity
            ) => (
              <div
                key={`${member.id}-${member.username}-${member.email}`} // Use member.id for a more stable key
                className={`relative rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out overflow-hidden border ${
                  //
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:border-blue-600"
                    : "bg-white border-gray-200 hover:border-blue-400"
                }`}
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteClick(member)}
                  className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-colors ${
                    isDark
                      ? "bg-gray-700/50 text-gray-400 hover:bg-red-800 hover:text-red-100"
                      : "bg-gray-100/50 text-gray-500 hover:bg-red-100 hover:text-red-600"
                  }`}
                  aria-label="Delete user"
                >
                  <Trash2 size={16} />
                </button>

                {/* Card Content */}
                <div className="p-6 text-center">
                  {/* Profile Image or Initials */}
                  <div className="mb-4 flex justify-center">
                    <div
                      className={`w-30 h-30 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg overflow-hidden ${
                        isDark ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    >
                      {member.profile_image ? (
                        <img
                          src={member.profile_image}
                          alt={`${member.first_name} ${member.last_name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback to initials if image fails to load
                            e.target.onerror = null; // prevent infinite loop
                            e.target.outerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">${getInitials(
                              member.first_name,
                              member.last_name
                            )}</div>`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold">
                          {getInitials(member.first_name, member.last_name)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <h3
                    className={`text-xl font-semibold mb-1 truncate ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {member.first_name || ""} {member.last_name || ""}
                  </h3>
                  {/* Role Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-block px-3 py-1 text-xs font-medium rounded-full border capitalize ${getRoleColor(
                        //
                        member.role
                      )}`}
                    >
                      {getRoleDisplayName(member.role)}
                    </span>
                  </div>
                  {/* Contact Info */}
                  <div className="space-y-2 text-sm">
                    <div
                      className={`flex items-center justify-center gap-2 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <User size={14} />
                      <span className="truncate">{member.username}</span>
                    </div>

                    <div
                      className={`flex items-center justify-center gap-2 ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      <Mail size={14} />
                      <span className="truncate">{member.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          )
        ) : (
          <div
            className={`col-span-full p-12 text-center rounded-2xl ${
              isDark
                ? "bg-gray-800 text-gray-400"
                : "bg-white text-gray-500 border border-gray-200"
            }`}
          >
            <div className="mb-4">
              <Users className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium mb-2">No team members found</h3>
            <p className={`${isDark ? "text-gray-500" : "text-gray-400"}`}>
              {searchTerm || roleFilter !== "All"
                ? "Try adjusting your search or filter criteria."
                : "Create a new user to get started."}
            </p>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-opacity-60 backdrop-blur-xl flex items-center justify-center z-50 p-4">
          <div
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300"
            }`}
          >
            {/* Modal Header */}
            <div
              className={`px-6 py-4 border-b sticky top-0 z-10 ${
                isDark
                  ? "border-gray-700 bg-gray-800"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-center">
                <h3
                  className={`text-xl font-semibold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Create New User
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isDark
                      ? "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                      : "text-gray-500 hover:bg-gray-200 hover:text-gray-700" //
                  }`}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                  <div>
                    <label
                      htmlFor="first_name"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="first_name"
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your first name"
                      className={`w-full px-4 py-2.5 border rounded-lg transition-colors shadow-sm ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="last_name"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="last_name"
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      placeholder="Enter your last name"
                      className={`w-full px-4 py-2.5 border rounded-lg transition-colors shadow-sm ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="username"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="username"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      placeholder="Enter your username"
                      className={`w-full px-4 py-2.5 border rounded-lg transition-colors shadow-sm ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="Email address"
                      className={`w-full px-4 py-2.5 border rounded-lg transition-colors shadow-sm ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="phone_number"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10);
                        handleChange({
                          target: { name: "phone_number", value },
                        });
                      }}
                      pattern="[0-9]{10}"
                      maxLength={10}
                      placeholder="10 digit phone number"
                      className={`w-full px-4 py-3 border rounded-lg transition-colors ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white"
                          : "bg-white border-gray-300 text-gray-800"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="role"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2.5 border rounded-lg transition-colors shadow-sm appearance-none ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    >
                      <option value="agent">Agent</option>
                      <option value="manager">Manager</option>
                      {/* Add Admin option if needed, ensure backend supports it */}
                      {/* <option value="admin">Administrator</option>  */}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      className={`w-full px-4 py-2.5 border rounded-lg transition-colors shadow-sm ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="password_confirm"
                      className={`block text-sm font-medium mb-1.5 ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="password_confirm"
                      type="password"
                      name="password_confirm"
                      value={formData.password_confirm}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password again"
                      className={`w-full px-4 py-2.5 border rounded-lg transition-colors shadow-sm ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-white border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                  </div>
                </div>
                {error && (
                  <div className="mt-4 text-sm text-red-500">{error}</div>
                )}

                {/* Modal Footer */}
                <div className="flex justify-end gap-3 mt-8 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                      isDark
                        ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Create User
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className={`relative p-6 w-full max-w-md rounded-2xl shadow-xl border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-300"
            }`}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>

              <h3
                className={`text-lg font-semibold mb-2 ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Delete User
              </h3>

              <p
                className={`mb-6 text-sm ${
                  isDark ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Are you sure you want to delete{" "}
                <span className="font-semibold">
                  {userToDelete.first_name} {userToDelete.last_name}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleDeleteCancel}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                    isDark //
                      ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TeamManagement;
