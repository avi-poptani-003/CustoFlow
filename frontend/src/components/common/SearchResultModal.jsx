"use client"
import { X, User, Home, Calendar, Users, FileText } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"

const SearchResultModal = ({ isOpen, onClose, result }) => {
  const { theme } = useTheme()
  const isDark = theme === "dark"

  if (!isOpen || !result) return null

  // Get icon for result type
  const getTypeIcon = (type) => {
    switch (type) {
      case "lead":
        return <User className="text-blue-500" size={24} />
      case "property":
        return <Home className="text-green-500" size={24} />
      case "task":
        return <Calendar className="text-orange-500" size={24} />
      case "user":
        return <Users className="text-purple-500" size={24} />
      default:
        return <FileText className="text-gray-500" size={24} />
    }
  }

  // Get badge for result type
  const getTypeBadge = (type) => {
    switch (type) {
      case "lead":
        return isDark ? "bg-blue-900/30 text-blue-300" : "bg-blue-100 text-blue-800"
      case "property":
        return isDark ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-800"
      case "task":
        return isDark ? "bg-orange-900/30 text-orange-300" : "bg-orange-100 text-orange-800"
      case "user":
        return isDark ? "bg-purple-900/30 text-purple-300" : "bg-purple-100 text-purple-800"
      default:
        return isDark ? "bg-gray-700 text-gray-300" : "bg-gray-100 text-gray-800"
    }
  }

  // Mock data for demonstration
  const mockDetails = {
    lead: {
      name: result.title,
      email: "contact@example.com",
      phone: "+1 (555) 123-4567",
      status: "New",
      source: "Website",
      assignedTo: "Alex Johnson",
      notes: "Interested in residential properties in the downtown area.",
    },
    property: {
      name: result.title,
      type: "Residential",
      address: "123 Main Street, Cityville",
      price: "$750,000",
      bedrooms: 3,
      bathrooms: 2,
      sqft: 2100,
      status: "Available",
      description: "Beautiful modern home with spacious rooms and a large backyard.",
    },
    task: {
      title: result.title,
      dueDate: "2025-05-25",
      priority: "High",
      assignedTo: "Maria Rodriguez",
      status: "Pending",
      description: "Follow up with client regarding their interest in the property.",
    },
    user: {
      name: result.title,
      role: "Sales Agent",
      email: "user@example.com",
      phone: "+1 (555) 987-6543",
      joinDate: "2024-01-15",
      activeDeals: 12,
      performance: "Excellent",
    },
  }

  const details = mockDetails[result.type] || {}

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className={`relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg shadow-xl p-6 ${
          isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getTypeIcon(result.type)}
            <div>
              <h3 className="text-xl font-bold">{result.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getTypeBadge(result.type)}`}>
                {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Description */}
        <p className={`mb-4 ${isDark ? "text-gray-300" : "text-gray-600"}`}>{result.description}</p>

        {/* Details */}
        <div className={`border-t ${isDark ? "border-gray-700" : "border-gray-200"} pt-4 mt-4`}>
          <h4 className="font-medium mb-3">Details</h4>

          <div className="space-y-2">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex justify-between">
                <span className={`${isDark ? "text-gray-400" : "text-gray-500"} capitalize`}>
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 border rounded-md ${
              isDark
                ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                : "border-gray-300 text-gray-700 hover:bg-gray-100"
            }`}
          >
            Close
          </button>
          <button
            className={`px-4 py-2 ${
              isDark ? "bg-blue-700 hover:bg-blue-800" : "bg-blue-600 hover:bg-blue-700"
            } text-white rounded-md`}
          >
            View Full Details
          </button>
        </div>
      </div>
    </div>
  )
}

export default SearchResultModal
