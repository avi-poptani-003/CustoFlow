// src/components/common/ErrorMessage.jsx
import { AlertCircle } from "lucide-react";
// Assuming ThemeContext is in src/context/ThemeContext.jsx
// Adjust the path if your ThemeContext is located elsewhere.
import { useTheme } from "../../context/ThemeContext";

const ErrorMessage = ({ error, onRetry }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 ${
        isDark ? "text-red-400" : "text-red-600"
      }`}
    >
      <div className="flex items-center mb-4">
        <AlertCircle className="h-6 w-6 mr-2" />
        <span>Failed to load data</span>
      </div>
      <p
        className={`mb-4 text-sm text-center ${
          isDark ? "text-gray-300" : "text-gray-700"
        }`}
      >
        {error || "An unexpected error occurred."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
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
};

export default ErrorMessage;
