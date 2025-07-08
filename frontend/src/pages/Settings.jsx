import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import authService from "../services/authService";
import { toast } from "react-toastify";
import {
  User,
  Palette,
  Mail,
  Phone,
  Camera,
  Shield,
  Sun,
  Moon,
  // Monitor, // Removed Monitor as System theme is removed
  Loader2,
  Check,
} from "lucide-react";
import { ChevronRight } from "lucide-react";
import { formatRelativeTime } from "../utils/formatters";

function Settings() {
  const { theme, setTheme, appliedTheme } = useTheme(); // Use appliedTheme
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone_number: user.phone_number || "",
        role: user.role || "",
      });
    }
  }, [user]);

  const isDark = appliedTheme === "dark"; // Use appliedTheme here
  const bgColor = isDark ? "bg-gray-800" : "bg-white";
  const textColor = isDark ? "text-gray-100" : "text-gray-800";
  const borderColor = isDark ? "border-gray-700" : "border-gray-200";
  const secondaryText = isDark ? "text-gray-400" : "text-gray-500";
  const inputBg = isDark ? "bg-gray-700" : "bg-gray-50";
  const inputBorder = isDark ? "border-gray-600" : "border-gray-300";
  const buttonHover = isDark ? "hover:bg-gray-700" : "hover:bg-gray-100";

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Create a new object for submission that excludes username, email, and role
    const { username: _username, email: _email, role: _role, ...submittableData } = formData;
    try {
      const updatedUser = await authService.updateUserProfile(submittableData); //
      setUser(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setImageLoading(true);
    try {
      const updatedUser = await authService.updateProfileImage(file); //
      setUser(updatedUser);
      toast.success("Profile image updated successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.detail || "Failed to update profile image"
      );
    } finally {
      setImageLoading(false);
    }
  };

  const handleChangePassword = () => {
    navigate("/dashboard/change-password");
  };

  return (
    <div className="p-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl md:text-3xl font-bold ${textColor}`}>
            Settings
          </h1>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content */}
          <div
            className={`${bgColor} rounded-xl shadow-sm p-6 border ${borderColor} lg:w-2/3`}
          >
            {/* Profile Section */}
            <div className="mb-10">
              <div className="flex items-center mb-6">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className={`text-xl font-semibold ${textColor}`}>
                  Profile
                </h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div
                      className={`w-24 h-24 rounded-full ${inputBg} flex items-center justify-center overflow-hidden relative`}
                    >
                      {imageLoading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <Loader2 className="w-6 h-6 text-white animate-spin" />
                        </div>
                      )}
                      <img
                        src={
                          user?.profile_image ||
                          "https://via.placeholder.com/96"
                        }
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={handleImageClick}
                      disabled={imageLoading}
                      className={`absolute bottom-0 right-0 p-2 rounded-full ${bgColor} border ${borderColor} ${buttonHover} ${
                        imageLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={imageLoading}
                    />
                  </div>
                  <div>
                    <h3 className={`text-lg font-medium ${textColor}`}>
                      {formData.first_name} {formData.last_name}
                    </h3>
                    <p className={secondaryText}>{formData.role}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      className={`block text-sm font-medium ${secondaryText} mb-2`}
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${inputBorder} ${textColor}`}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium ${secondaryText} mb-2`}
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${inputBorder} ${textColor}`}
                      placeholder="Enter last name"
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium ${secondaryText} mb-2`}
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className={`absolute left-3 top-2.5 w-5 h-5 ${secondaryText}`}
                      />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBg} ${inputBorder} ${textColor} bg-opacity-50 cursor-not-allowed`}
                        placeholder="Enter email address"
                        disabled
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium ${secondaryText} mb-2`}
                    >
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone
                        className={`absolute left-3 top-2.5 w-5 h-5 ${secondaryText}`}
                      />
                        <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleInputChange({ target: { name: 'phone_number', value } });
                        }}
                        pattern="[0-9]{10}"
                        maxLength={10}
                        title="Please enter exactly 10 digits"
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${inputBg} ${inputBorder} ${textColor}`}
                        placeholder="Enter 10-digit phone number"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium ${secondaryText} mb-2`}
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${inputBorder} ${textColor} bg-opacity-50 cursor-not-allowed`}
                      placeholder="Enter username"
                      disabled
                    />
                  </div>
                  <div>
                    <label
                      className={`block text-sm font-medium ${secondaryText} mb-2`}
                    >
                      Role
                    </label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      className={`w-full px-4 py-2 rounded-lg border ${inputBg} ${inputBorder} ${textColor} bg-opacity-50 cursor-not-allowed`}
                      disabled
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div>
              <div className="flex items-center mb-6">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className={`text-xl font-semibold ${textColor}`}>
                  Security
                </h2>
              </div>

              <div className="space-y-6">
                <div
                  className={`p-4 rounded-lg border ${borderColor} ${buttonHover} cursor-pointer`}
                  onClick={handleChangePassword}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3
                        className={`text-lg font-medium ${textColor} mb-2`}
                      >
                        Password
                      </h3>
                      <p className={secondaryText}>
                        Last changed:{" "}
                        {user?.password_last_changed_at
                          ? formatRelativeTime(user.password_last_changed_at)
                          : "Never"}
                      </p>
                    </div>
                    <ChevronRight className={`w-5 h-5 ${secondaryText}`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Section (Right Side) */}
          <div
            className={`${bgColor} rounded-xl shadow-sm border ${borderColor} lg:w-1/3 h-fit sticky top-6`}
          >
            <div className="p-6  border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-4">
                <Palette className="w-5 h-5 mr-2 text-blue-600" />
                <h2 className={`text-xl font-semibold ${textColor}`}>
                  Appearance
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-3">
                {/* Light Theme Option */}
                <div
                  onClick={() => setTheme("light")}
                  className={`relative rounded-lg overflow-hidden transition-all duration-200 ${
                    theme === "light" || (theme === "auto" && !isDark) // Retain selection logic for 'auto' if preferred default is light
                      ? "ring-2 ring-blue-500"
                      : `border ${borderColor} hover:border-blue-400`
                  }`}
                >
                  <div className="p-4 flex items-center cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3 flex-shrink-0">
                      <Sun className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-base font-medium ${
                          theme === "light" || (theme === "auto" && !isDark) ? "text-blue-600" : textColor
                        }`}
                      >
                        Light
                      </h3>
                      <p className={`text-xs ${secondaryText}`}>
                        Bright and clear interface
                      </p>
                    </div>
                    {(theme === "light" || (theme === "auto" && !isDark)) && (
                      <div className="ml-2 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Dark Theme Option */}
                <div
                  onClick={() => setTheme("dark")}
                  className={`relative rounded-lg overflow-hidden transition-all duration-200 ${
                    theme === "dark" || (theme === "auto" && isDark) // Retain selection logic for 'auto' if preferred default is dark
                      ? "ring-2 ring-blue-500"
                      : `border ${borderColor} hover:border-blue-400`
                  }`}
                >
                  <div className="p-4 flex items-center cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0">
                      <Moon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-base font-medium ${
                          theme === "dark" || (theme === "auto" && isDark) ? "text-blue-400" : textColor
                        }`}
                      >
                        Dark
                      </h3>
                      <p className={`text-xs ${secondaryText}`}>
                        Easy on the eyes
                      </p>
                    </div>
                    {(theme === "dark" || (theme === "auto" && isDark)) && (
                      <div className="ml-2 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                </div>

                {/* System Theme Option - REMOVED */}
                {/*
                <div
                  onClick={() => setTheme("auto")}
                  className={`relative rounded-lg overflow-hidden transition-all duration-200 ${
                    theme === "auto" // Check for "auto"
                      ? "ring-2 ring-blue-500"
                      : `border ${borderColor} hover:border-blue-400`
                  }`}
                >
                  <div className="p-4 flex items-center cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-700 dark:to-gray-900 flex items-center justify-center mr-3 flex-shrink-0">
                      <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className={`text-base font-medium ${
                          theme === "auto" // Check for "auto"
                            ? "text-blue-500 dark:text-blue-400"
                            : textColor
                        }`}
                      >
                        System
                      </h3>
                      <p className={`text-xs ${secondaryText}`}>
                        Follows your device settings
                      </p>
                    </div>
                    {theme === "auto" && ( // Check for "auto"
                      <div className="ml-2 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                    )}
                  </div>
                </div>
                */}
              </div>

              {/* Theme Preview */}
              <div className="mt-8">
                <h3 className={`text-sm font-medium ${secondaryText} mb-3`}>
                  Preview
                </h3>
                {/* Updated to grid-cols-2 as System preview is removed */}
                <div className="grid grid-cols-2 gap-3"> 
                  {/* Light Theme Preview */}
                  <div
                    className={`rounded-lg overflow-hidden border ${borderColor}`}
                  >
                    <div className="bg-white border-b border-gray-200 p-2 flex items-center justify-between">
                      <div className="font-medium text-gray-800 text-xs">
                        Light
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 flex">
                      {/* Sidebar */}
                      <div className="w-1/3 pr-1">
                        <div className="rounded p-1 mb-1 bg-blue-100 text-blue-700 flex items-center">
                          <div className="w-2 h-2 rounded-sm bg-current"></div>
                        </div>
                        <div className="rounded p-1 mb-1 text-gray-600 flex items-center">
                          <div className="w-2 h-2 rounded-sm bg-current"></div>
                        </div>
                      </div>
                      {/* Main Content */}
                      <div className="w-2/3 pl-1">
                        <div className="h-2 w-3/4 rounded mb-1 bg-white"></div>
                        <div className="h-2 w-full rounded mb-1 bg-white"></div>
                        <div className="h-2 w-5/6 rounded mb-2 bg-white"></div>
                        <div className="flex gap-1">
                          <div className="h-3 w-8 rounded bg-blue-500"></div>
                          <div className="h-3 w-8 rounded bg-white"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dark Theme Preview */}
                  <div
                    className={`rounded-lg overflow-hidden border ${borderColor}`}
                  >
                    <div className="bg-gray-900 border-b border-gray-700 p-2 flex items-center justify-between">
                      <div className="font-medium text-gray-100 text-xs">
                        Dark
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      </div>
                    </div>
                    <div className="bg-gray-800 p-2 flex">
                      {/* Sidebar */}
                      <div className="w-1/3 pr-1">
                        <div className="rounded p-1 mb-1 bg-blue-900/30 text-blue-400 flex items-center">
                          <div className="w-2 h-2 rounded-sm bg-current"></div>
                        </div>
                        <div className="rounded p-1 mb-1 text-gray-400 flex items-center">
                          <div className="w-2 h-2 rounded-sm bg-current"></div>
                        </div>
                      </div>
                      {/* Main Content */}
                      <div className="w-2/3 pl-1">
                        <div className="h-2 w-3/4 rounded mb-1 bg-gray-700"></div>
                        <div className="h-2 w-full rounded mb-1 bg-gray-700"></div>
                        <div className="h-2 w-5/6 rounded mb-2 bg-gray-700"></div>
                        <div className="flex gap-1">
                          <div className="h-3 w-8 rounded bg-blue-600"></div>
                          <div className="h-3 w-8 rounded bg-gray-700"></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Theme Preview - REMOVED */}
                  {/*
                  <div
                    className={`rounded-lg overflow-hidden border ${borderColor}`}
                  >
                    <div
                      className={`${
                        isDark
                          ? "bg-gray-900 border-gray-700"
                          : "bg-white border-gray-200"
                      } border-b p-2 flex items-center justify-between`}
                    >
                      <div
                        className={`font-medium ${
                          isDark ? "text-gray-100" : "text-gray-800"
                        } text-xs`}
                      >
                        System
                      </div>
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isDark ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        ></div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isDark ? "bg-blue-600" : "bg-blue-500"
                          }`}
                        ></div>
                      </div>
                    </div>
                    <div
                      className={`${
                        isDark ? "bg-gray-800" : "bg-gray-50"
                      } p-2 flex`}
                    >
                      <div className="w-1/3 pr-1">
                        <div
                          className={`rounded p-1 mb-1 ${
                            isDark
                              ? "bg-blue-900/30 text-blue-400"
                              : "bg-blue-100 text-blue-700"
                          } flex items-center`}
                        >
                          <div className="w-2 h-2 rounded-sm bg-current"></div>
                        </div>
                        <div
                          className={`rounded p-1 mb-1 ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          } flex items-center`}
                        >
                          <div className="w-2 h-2 rounded-sm bg-current"></div>
                        </div>
                      </div>
                      <div className="w-2/3 pl-1">
                        <div
                          className={`h-2 w-3/4 rounded mb-1 ${
                            isDark ? "bg-gray-700" : "bg-white"
                          }`}
                        ></div>
                        <div
                          className={`h-2 w-full rounded mb-1 ${
                            isDark ? "bg-gray-700" : "bg-white"
                          }`}
                        ></div>
                        <div
                          className={`h-2 w-5/6 rounded mb-2 ${
                            isDark ? "bg-gray-700" : "bg-white"
                          }`}
                        ></div>
                        <div className="flex gap-1">
                          <div
                            className={`h-3 w-8 rounded ${
                              isDark ? "bg-blue-600" : "bg-blue-500"
                            }`}
                          ></div>
                          <div
                            className={`h-3 w-8 rounded ${
                              isDark ? "bg-gray-700" : "bg-white"
                            }`}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;