import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "@/context/ThemeContext"
import { useAuth } from "@/context/AuthContext"
// import Navbar from "@/components/common/Navbar"
import propertyService from "@/services/propertyService"
import { toast } from "react-toastify"
import { formatCurrency } from "@/utils/formatters"

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [propertyType, setPropertyType] = useState("All Types")
  const [propertyStatus, setPropertyStatus] = useState("All Statuses")
  const { theme } = useTheme()
  const { user } = useAuth()
  const isDark = theme === "dark"

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProperties = async () => {
      if (!user) {
        setError("Please log in to view properties")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await propertyService.getProperties()
        if (Array.isArray(data)) {
          setProperties(data)
          setError(null)
        } else {
          setError("Invalid data format received from server")
        }
      } catch (err) {
        setError(
          err.response?.status === 401
            ? "Please log in to view properties"
            : "Failed to load properties. Please try again later.",
        )
      } finally {
        setLoading(false)
      }
    }

    fetchProperties()
  }, [user])

  // Filter properties
  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType =
      propertyType === "All Types" || property.property_type?.toLowerCase() === propertyType.toLowerCase()

    const matchesStatus =
      propertyStatus === "All Statuses" || property.status?.toLowerCase() === propertyStatus.toLowerCase()

    return matchesSearch && matchesType && matchesStatus
  })

  const handleDelete = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return
    }

    try {
      await propertyService.deleteProperty(propertyId)
      setProperties(properties.filter((p) => p.id !== propertyId))
      toast.success("Property deleted successfully")
    } catch {
      toast.error("Failed to delete property")
    }
  }

  // Status configuration
  const STATUS_CONFIG = {
    available: { badge: "bg-green-100 text-green-800", label: "Available" },
    under_construction: { badge: "bg-yellow-100 text-yellow-800", label: "Under Construction" },
    coming_soon: { badge: "bg-blue-100 text-blue-800", label: "Coming Soon" },
    sold_out: { badge: "bg-red-100 text-red-800", label: "Sold Out" },
  }

  const getStatusConfig = (status) =>
    STATUS_CONFIG[status] || {
      badge: "bg-gray-100 text-gray-800",
      label: status,
    }

  // Property type icons
  const PROPERTY_TYPE_ICONS = {
    house: "fa-home",
    commercial: "fa-building",
    land: "fa-map-marked-alt",
    apartment: "fa-building-user",
    villa: "fa-house-chimney",
    plot: "fa-vector-square",
  }

  const getPropertyIcon = (type) => PROPERTY_TYPE_ICONS[type] || "fa-building"

  // Edit Icon SVG Component
  const EditIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"></path>
    </svg>
  )

  // Delete Icon SVG Component
  const DeleteIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18"></path>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
    </svg>
  )

  // Property Card Component
  const PropertyCard = ({ property }) => {
    const [imageError, setImageError] = useState(false)
    const statusConfig = getStatusConfig(property.status)

    const imageUrl =
      imageError || !property.images || property.images.length === 0
        ? "/placeholder.svg"
        : propertyService.getImageUrl(property.images[0].image)

    return (
      <div
        className={`rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl ${
          isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        {/* Image Section */}
        <Link to={`/dashboard/properties/${property.id}`}>
        <div className="relative h-56 overflow-hidden group">
          <img
            src={imageUrl || "/placeholder.svg"}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
          <span className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.badge}`}>
            {statusConfig.label}
          </span>
        </div>
      </Link>

        {/* Content Section */}
        <div className="p-5">
          <div className="mb-4">
            <Link to={`/dashboard/properties/${property.id}`}>
            <h3 className="text-lg font-bold mb-2 line-clamp-2">{property.title}</h3>
            </Link>
            <p className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
              <i className="fas fa-map-marker-alt mr-2"></i>
              <span className="line-clamp-1">{property.location}</span>
            </p>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{formatCurrency(property.price)}</p>
          </div>

          {/* Property Features */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center">
              <i className={`fas ${getPropertyIcon(property.property_type)} mr-2 text-gray-500 dark:text-gray-400`}></i>
              <span className="text-sm capitalize">{property.property_type}</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-ruler-combined mr-2 text-gray-500 dark:text-gray-400"></i>
              <span className="text-sm">{formatCurrency(property.area)} sq.ft</span>
            </div>
            {property.bhk && (
              <div className="flex items-center">
                <i className="fas fa-bed mr-2 text-gray-500 dark:text-gray-400"></i>
                <span className="text-sm">{property.bhk} BHK</span>
              </div>
            )}
            <div className="flex items-center">
              <i className="fas fa-calendar-day mr-2 text-gray-500 dark:text-gray-400"></i>
              <span className="text-sm">{property.possession_timeline || "Ready"}</span>
            </div>
          </div>

          {/* Progress Bar (if applicable) */}
          {property.units_available_display && (
            <div className="mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{property.units_available_display}</p>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${property.progress || 0}%` }} />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between mt-4">
            <Link
              to={`/dashboard/properties/${property.id}`}
              className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 mr-2"
            >
              <i className="fas fa-eye mr-2"></i>
              View
            </Link>
            <div className="flex">
              <Link
                to={`/dashboard/properties/edit/${property.id}`}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 mr-2 border ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 border-gray-600"
                    : "bg-white hover:bg-gray-100 border-gray-200"
                }`}
                title="Edit Property"
              >
                <span className="text-blue-500">
                  <EditIcon />
                </span>
              </Link>
              <button
                onClick={() => handleDelete(property.id)}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors duration-200 border ${
                  isDark
                    ? "bg-gray-700 hover:bg-gray-600 border-gray-600"
                    : "bg-white hover:bg-gray-100 border-gray-200"
                }`}
                title="Delete Property"
              >
                <span className="text-red-500">
                  <DeleteIcon />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900 text-white" : "bg-gray-50"}`}>
      {/* <Navbar /> */}
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Property Listings</h1>
              <p className="text-gray-500 dark:text-gray-400">Manage your real estate properties</p>
            </div>
            <Link
              to="/dashboard/properties/add"
              className="flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Property
            </Link>
          </div>
        </header>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="fas fa-search text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Search properties by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
                }`}
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className={`px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
              }`}
            >
              <option>All Types</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
              <option value="plot">Plot</option>
            </select>

            <select
              value={propertyStatus}
              onChange={(e) => setPropertyStatus(e.target.value)}
              className={`px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
              }`}
            >
              <option>All Statuses</option>
              <option value="available">Available</option>
              <option value="under_construction">Under Construction</option>
              <option value="coming_soon">Coming Soon</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>
        </div>

        {/* Properties Layout */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
              <i className="fas fa-exclamation-circle text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">{error}</h3>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Try Again
            </button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
              <i className="fas fa-search text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">No properties found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Try adjusting your search filters or add a new property
            </p>
            <Link
              to="/dashboard/properties/add"
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <i className="fas fa-plus mr-2"></i>
              Add New Property
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Properties