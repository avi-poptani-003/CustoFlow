// src/components/common/LoadingSpinner.jsx
import { RefreshCw } from "lucide-react";
// Assuming ThemeContext is in src/context/ThemeContext.jsx
// Adjust the path if your ThemeContext is located elsewhere.
import { useTheme } from "../../context/ThemeContext";

const LoadingSpinner = ({ size = "md" }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const sizes = {
    sm: { icon: 16, text: "text-sm" },
    md: { icon: 20, text: "text-base" },
    lg: { icon: 24, text: "text-lg" },
    xl: { icon: 32, text: "text-xl" },
  };

  return (
    <div className="flex items-center justify-center p-4">
      <RefreshCw
        className={`animate-spin ${isDark ? "text-gray-400" : "text-gray-600"}`}
        size={sizes[size]?.icon || sizes["md"].icon} // Fallback to md if size is invalid
      />
      <span
        className={`ml-2 ${sizes[size]?.text || sizes["md"].text} ${
          // Fallback to md
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        Loading...
      </span>
    </div>
  );
};

export default LoadingSpinner;
