import illustration from "../assets/image.png";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

const LoginCard = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, error, setError } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const isDark = theme === "dark";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setError("Please enter both username and password");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login(formData);
      if (response.success) {
        // Redirect to dashboard for admin, or to the original requested page for others
        const redirectPath = response.role === "admin" ? "/dashboard" : from;
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        isDark
          ? "bg-gray-900 bg-[radial-gradient(circle,_#3f3f6e_2px,_transparent_3px)]"
          : "bg-[#f4f4f4] bg-[radial-gradient(circle,_#ddd6fe_2px,_transparent_3px)]"
      } bg-[size:30px_30px] p-4`}
    >
      <div
        className={`w-full max-w-[900px] min-h-[500px] max-h-[90vh] md:h-[600px] md:max-h-[85vh] rounded-[20px] ${
          isDark ? "bg-gray-800" : "bg-white"
        } shadow-xl flex overflow-hidden relative`}
      >
        <div className={`w-full ${isDark ? "bg-gray-800" : "bg-white"}`}></div>
        <div className="hidden md:block w-[40%] bg-[#5B5BF0] h-full"></div>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div
            className={`w-full h-full max-h-full overflow-y-auto md:w-[90%] md:h-[90%] md:max-h-[500px]
                ${isDark ? "bg-gray-800" : "bg-white"} 
                md:rounded-[12px] md:shadow-2xl 
                flex flex-col md:flex-row`}
          >
            {/* Left Blue Section - Hidden on mobile, visible on md and up */}
            <div className="hidden md:flex w-1/3 bg-[#5B5BF0] text-white flex-col justify-center items-center p-6">
              <div className="flex flex-col items-center">
                <img
                  src={illustration || "/placeholder.svg"}
                  alt="CRM Illustration"
                  className="mb-4 w-32 lg:w-40"
                />
                <p className="text-center text-sm">
                  Your all-in-one solution for customer relationship management.
                </p>
              </div>
              <ul className="space-y-4 mt-6 text-sm">
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-2 text-lg">➤</span> 360°
                  view of your customers
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-2 text-lg">➤</span>{" "}
                  Advanced analytics & reporting
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-300 mr-2 text-lg">➤</span>{" "}
                  Automated workflow management
                </li>
              </ul>
            </div>

            {/* Right White Login Section */}
            <div
              className={`w-full md:w-[67%] ${
                isDark ? "bg-gray-800" : "bg-white"
              } flex items-center justify-center p-6 md:p-12`}
            >
              <div className="w-full max-w-[400px]">
                <h2
                  className={`text-2xl md:text-3xl font-bold ${
                    isDark ? "text-white" : "text-black"
                  } mb-2`}
                >
                  Welcome to CRM
                </h2>
                <p
                  className={`text-lg md:text-xl ${
                    isDark ? "text-gray-300" : "text-black"
                  } mb-6 md:mb-8`}
                >
                  Welcome back User
                </p>

                {error && (
                  <div className="mb-4 text-red-500 text-sm">{error}</div>
                )}

                <form className="w-full" onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <label
                      htmlFor="username"
                      className={`block text-sm font-medium ${
                        isDark ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      Username
                    </label>
                    <div className="mt-1">
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        required
                        value={formData.username}
                        onChange={handleChange}
                        className={`appearance-none block w-full px-3 py-2 border ${
                          isDark
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-black placeholder-gray-400"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-1">
                      <label
                        className={`block text-sm font-medium ${
                          isDark ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        Password
                      </label>
                    </div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className={`w-full px-4 py-2 border ${
                        isDark
                          ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                          : "bg-white border-gray-300 text-black placeholder-gray-400"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                    />
                    <a
                      href="/forgot-password"
                      className={`text-sm float-right p-3 ${
                        isDark
                          ? "text-blue-400 hover:text-blue-300"
                          : "text-blue-600 hover:text-blue-700"
                      }`}
                    >
                      Forgot Password?
                    </a>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-md transition"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Logging in..." : "Login →"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginCard;
