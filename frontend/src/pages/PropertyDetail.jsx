// src/pages/PropertyDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext"; // Ensure this path is correct
import propertyService from "../services/propertyService"; // Ensure this path is correct
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Calendar,
  Maximize,
  Home,
  DollarSign,
  Compass,
  Briefcase,
  Share2,
  Heart,
  Printer,
  Clock,
  Check,
  X,
  Zap,
  ListChecks,
} from "lucide-react"; // Added Zap, ListChecks
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Helper functions (defined outside the component for clarity)
const formatPrice = (price) => {
  if (price === null || typeof price === "undefined") return "N/A";
  return Number(price).toLocaleString("en-IN");
};

const capitalizeAndFormatDisplayValue = (value) => {
  if (
    value === null ||
    typeof value === "undefined" ||
    String(value).trim() === ""
  ) {
    return "N/A";
  }
  const strValue = String(value);
  if (!isNaN(parseFloat(strValue)) && isFinite(Number(strValue)))
    return strValue;
  if (
    strValue.includes("sq.ft") ||
    strValue.includes("×") ||
    strValue.includes("₹")
  )
    return strValue;
  if (/\d{1,2}\s\w+\s\d{4}/.test(strValue)) return strValue;

  return strValue
    .replace(/_/g, " ")
    .toLowerCase()
    .split(" ")
    .map((word) => {
      if (word.toLowerCase() === "bhk") return "BHK";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
};

const getStatusBadgeClass = (status) => {
  const safeStatus = String(status || "").toLowerCase();
  switch (safeStatus) {
    case "available":
      return "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300";
    case "under_construction":
      return "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300";
    case "coming_soon":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300";
    case "sold_out":
      return "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  }
};

const getStatusTextClass = (status) => {
  const safeStatus = String(status || "").toLowerCase();
  switch (safeStatus) {
    case "available":
      return "text-green-700 dark:text-green-300";
    case "under_construction":
      return "text-orange-700 dark:text-orange-300";
    case "coming_soon":
      return "text-blue-700 dark:text-blue-300";
    case "sold_out":
      return "text-red-700 dark:text-red-300";
    default:
      return "text-gray-700 dark:text-gray-300";
  }
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showAllThumbnails, setShowAllThumbnails] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [shareStatus, setShareStatus] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [printStatus, setPrintStatus] = useState({
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (property) {
      const savedProperties = JSON.parse(
        localStorage.getItem("savedProperties") || "[]"
      );
      const isPropertySaved = savedProperties.some(
        (savedProp) => savedProp.id === property.id
      );
      setIsSaved(isPropertySaved);
    }
  }, [property]);

  useEffect(() => {
    if (id && id !== "undefined" && id !== null) {
      setLoading(true);
      setError(null);
      setProperty(null);
    } else {
      setError("Invalid property ID");
      setProperty(null);
      setLoading(false);
      return;
    }

    const storedPropertyData = sessionStorage.getItem("lastCreatedProperty");
    const newlyCreatedPropertyData = sessionStorage.getItem(
      "newlyCreatedProperty"
    );
    let dataFoundInSession = false;

    if (newlyCreatedPropertyData) {
      try {
        const parsedProperty = JSON.parse(newlyCreatedPropertyData);
        if (
          parsedProperty &&
          parsedProperty.id &&
          parsedProperty.id.toString() === id
        ) {
          setProperty(parsedProperty);
          sessionStorage.removeItem("newlyCreatedProperty");
          dataFoundInSession = true;
        }
      } catch (err) {
        console.error("Error parsing newly created property:", err);
      }
    }

    if (!dataFoundInSession && storedPropertyData) {
      try {
        const parsedProperty = JSON.parse(storedPropertyData);
        if (
          parsedProperty &&
          parsedProperty.id &&
          parsedProperty.id.toString() === id
        ) {
          setProperty(parsedProperty);
          sessionStorage.removeItem("lastCreatedProperty");
          dataFoundInSession = true;
        }
      } catch (err) {
        console.error("Error parsing stored property:", err);
      }
    }

    if (dataFoundInSession) {
      setLoading(false);
      return;
    }

    const fetchPropertyFromAPI = async () => {
      try {
        const data = await propertyService.getProperty(id);
        setProperty(data); // This data should now include amenities and specifications
      } catch (err) {
        console.error("Error fetching property from API:", err);
        setError(err.message || "Failed to load property");
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyFromAPI();
  }, [id, navigate]);

  const handleShare = async () => {
    if (!property) return;
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title} in ${property.location}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareStatus({
          show: true,
          message: "Property shared successfully!",
          type: "success",
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareStatus({
          show: true,
          message: "Link copied to clipboard!",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error sharing property:", error);
      setShareStatus({
        show: true,
        message: "Failed to share property",
        type: "error",
      });
    }
    setTimeout(
      () => setShareStatus({ show: false, message: "", type: "" }),
      3000
    );
  };

  const handleSave = () => {
    if (!property) return;
    try {
      const savedProperties = JSON.parse(
        localStorage.getItem("savedProperties") || "[]"
      );
      if (isSaved) {
        const updatedProperties = savedProperties.filter(
          (savedProp) => savedProp.id !== property.id
        );
        localStorage.setItem(
          "savedProperties",
          JSON.stringify(updatedProperties)
        );
        setIsSaved(false);
        setShareStatus({
          show: true,
          message: "Removed from favorites",
          type: "success",
        });
      } else {
        const propertyToSave = {
          id: property.id,
          title: property.title,
          location: property.location,
          price: property.price,
          property_type: property.property_type,
          area: property.area,
          status: property.status,
          thumbnail:
            property.images && property.images.length > 0
              ? typeof propertyService.getImageUrl === "function"
                ? propertyService.getImageUrl(property.images[0].image)
                : property.images[0].image
              : null,
          savedAt: new Date().toISOString(),
        };
        savedProperties.push(propertyToSave);
        localStorage.setItem(
          "savedProperties",
          JSON.stringify(savedProperties)
        );
        setIsSaved(true);
        setShareStatus({
          show: true,
          message: "Added to favorites!",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Error saving property:", error);
      setShareStatus({
        show: true,
        message: "Failed to save property",
        type: "error",
      });
    }
    setTimeout(
      () => setShareStatus({ show: false, message: "", type: "" }),
      3000
    );
  };

  const handlePrint = async () => {
    if (!property) return;
    setPrintStatus({ loading: true, error: null });
    try {
      const printContainer = document.createElement("div");
      printContainer.id = "print-container";
      printContainer.style.cssText =
        "width: 100%; padding: 20px; background-color: white; color: black;";

      // Generate amenities HTML for PDF
      let amenitiesHtml = "";
      if (property.amenities && property.amenities.length > 0) {
        amenitiesHtml +=
          '<div style="margin-bottom: 20px;"><h2 style="font-size: 18px; margin-bottom: 10px;">Amenities</h2><ul style="list-style: disc; padding-left: 20px;">';
        property.amenities.forEach((amenity) => {
          amenitiesHtml += `<li>${capitalizeAndFormatDisplayValue(
            amenity.name
          )}</li>`;
        });
        amenitiesHtml += "</ul></div>";
      }

      // Generate specifications HTML for PDF
      let specificationsHtml = "";
      if (property.specifications && property.specifications.length > 0) {
        specificationsHtml +=
          '<div style="margin-bottom: 20px;"><h2 style="font-size: 18px; margin-bottom: 10px;">Specifications</h2><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">';
        property.specifications.forEach((spec) => {
          specificationsHtml += `<div style="padding: 10px; background-color: #f8f9fa; border-radius: 4px;"><p style="color: #666; font-size: 14px;">${capitalizeAndFormatDisplayValue(
            spec.key
          )}</p><p>${capitalizeAndFormatDisplayValue(spec.value)}</p></div>`;
        });
        specificationsHtml += "</div></div>";
      }

      printContainer.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
          <h1 style="font-size: 24px; margin-bottom: 10px;">${
            property.title
          }</h1>
          <p style="color: #666; margin-bottom: 20px;">${property.location}</p>
          ${
            property.images && property.images.length > 0
              ? `<div style="margin-bottom: 20px;"><img src="${
                  typeof propertyService.getImageUrl === "function"
                    ? propertyService.getImageUrl(property.images[0].image)
                    : property.images[0].image
                }" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px;" alt="${
                  property.title
                }" /></div>`
              : ""
          }
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
            <div><p style="color: #666; font-size: 14px;">Price</p><p style="font-size: 20px; font-weight: bold;">₹${formatPrice(
              property.price
            )}</p></div>
            <div><p style="color: #666; font-size: 14px;">Area</p><p style="font-size: 16px;">${
              property.area
            } sq.ft</p></div>
            <div><p style="color: #666; font-size: 14px;">Type</p><p style="font-size: 16px;">${capitalizeAndFormatDisplayValue(
              property.property_type
            )}</p></div>
            <div><p style="color: #666; font-size: 14px;">Status</p><p style="font-size: 16px;">${capitalizeAndFormatDisplayValue(
              property.status
            )}</p></div>
          </div>
          <div style="margin-bottom: 20px;"><h2 style="font-size: 18px; margin-bottom: 10px;">Description</h2><p style="line-height: 1.6;">${
            property.description
          }</p></div>
          <div style="margin-bottom: 20px;"><h2 style="font-size: 18px; margin-bottom: 10px;">Property Details</h2><div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              <div style="padding: 10px; background-color: #f8f9fa; border-radius: 4px;"><p style="color: #666; font-size: 14px;">Property Type</p><p>${capitalizeAndFormatDisplayValue(
                property.property_type
              )}</p></div>
              ${
                property.property_sub_type
                  ? `<div style="padding: 10px; background-color: #f8f9fa; border-radius: 4px;"><p style="color: #666; font-size: 14px;">Property Sub-Type</p><p>${capitalizeAndFormatDisplayValue(
                      property.property_sub_type
                    )}</p></div>`
                  : ""
              }
              ${
                property.listing_type
                  ? `<div style="padding: 10px; background-color: #f8f9fa; border-radius: 4px;"><p style="color: #666; font-size: 14px;">Listing Type</p><p>${capitalizeAndFormatDisplayValue(
                      property.listing_type
                    )}</p></div>`
                  : ""
              }
              ${
                property.furnishing_status
                  ? `<div style="padding: 10px; background-color: #f8f9fa; border-radius: 4px;"><p style="color: #666; font-size: 14px;">Furnishing</p><p>${capitalizeAndFormatDisplayValue(
                      property.furnishing_status
                    )}</p></div>`
                  : ""
              }
              ${
                property.facing
                  ? `<div style="padding: 10px; background-color: #f8f9fa; border-radius: 4px;"><p style="color: #666; font-size: 14px;">Facing</p><p>${capitalizeAndFormatDisplayValue(
                      property.facing
                    )}</p></div>`
                  : ""
              }
              ${
                property.possession_status
                  ? `<div style="padding: 10px; background-color: #f8f9fa; border-radius: 4px;"><p style="color: #666; font-size: 14px;">Possession Status</p><p>${capitalizeAndFormatDisplayValue(
                      property.possession_status
                    )}</p></div>`
                  : ""
              }
          </div></div>
          ${amenitiesHtml}
          ${specificationsHtml}
          ${
            property.contact_name || property.contact_phone
              ? `<div style="margin-bottom: 20px;"><h2 style="font-size: 18px; margin-bottom: 10px;">Contact Information</h2>${
                  property.contact_name
                    ? `<p style="margin-bottom: 5px;"><strong>Contact Person:</strong> ${property.contact_name}</p>`
                    : ""
                }${
                  property.contact_phone
                    ? `<p style="margin-bottom: 5px;"><strong>Phone:</strong> ${property.contact_phone}</p>`
                    : ""
                }</div>`
              : ""
          }
          <div style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;"><p>Property details printed on ${new Date().toLocaleDateString()}</p></div>
        </div>`;
      document.body.appendChild(printContainer);
      const canvas = await html2canvas(printContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let heightLeft = pdfHeight;
      let position = 0;
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      pdf.save(`${property.title.replace(/\s+/g, "_")}_details.pdf`);
      document.body.removeChild(printContainer);
      setPrintStatus({ loading: false, error: null });
      setShareStatus({
        show: true,
        message: "PDF saved successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Error generating PDF:", err);
      setPrintStatus({ loading: false, error: err.message });
      setShareStatus({
        show: true,
        message: "Failed to generate PDF",
        type: "error",
      });
    }
    setTimeout(
      () => setShareStatus({ show: false, message: "", type: "" }),
      3000
    );
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${
          isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
        }`}
      >
        <div className="container mx-auto px-4 py-8">
          <div
            className={`h-8 w-32 ${
              isDark ? "bg-gray-700" : "bg-gray-300"
            } rounded animate-pulse mb-8`}
          ></div>
          <div
            className={`h-10 w-3/4 ${
              isDark ? "bg-gray-700" : "bg-gray-300"
            } rounded animate-pulse mb-2`}
          ></div>
          <div
            className={`h-6 w-1/2 ${
              isDark ? "bg-gray-700" : "bg-gray-300"
            } rounded animate-pulse mb-8`}
          ></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div
                className={`h-96 ${
                  isDark ? "bg-gray-700" : "bg-gray-300"
                } rounded-xl animate-pulse`}
              ></div>
              <div className="grid grid-cols-5 gap-2 mt-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-20 ${
                      isDark ? "bg-gray-700" : "bg-gray-300"
                    } rounded animate-pulse`}
                  ></div>
                ))}
              </div>
            </div>
            <div
              className={`h-[500px] ${
                isDark ? "bg-gray-700" : "bg-gray-300"
              } rounded-xl animate-pulse`}
            ></div>
          </div>
          <div
            className={`h-64 ${
              isDark ? "bg-gray-700" : "bg-gray-300"
            } rounded-xl animate-pulse mb-8`}
          ></div>
          <div
            className={`h-96 ${
              isDark ? "bg-gray-700" : "bg-gray-300"
            } rounded-xl animate-pulse`}
          ></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div
          className={`${
            isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          } shadow-xl rounded-xl p-8 max-w-lg mx-4`}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-full flex items-center justify-center">
            <X size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">
            Error Loading Property
          </h2>
          <p className="text-center mb-6 text-gray-600 dark:text-gray-300">
            {error}
          </p>
          <button
            onClick={() => navigate("/dashboard/properties")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Properties
          </button>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div
          className={`${
            isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          } shadow-xl rounded-xl p-8 max-w-lg mx-4`}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full flex items-center justify-center">
            <Home size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-center mb-4">
            Property Not Found
          </h2>
          <p className="text-center mb-6 text-gray-600 dark:text-gray-300">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/dashboard/properties")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const mainImage =
    property.images && property.images.length > 0
      ? typeof propertyService.getImageUrl === "function"
        ? propertyService.getImageUrl(property.images[activeImage].image)
        : property.images[activeImage].image
      : "/placeholder.svg";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isNewProperty = () => {
    if (!property.created_at) return false;
    const createdDate = new Date(property.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const handleWhatsAppRedirect = () => {
    if (!property.contact_phone) return;
    const formattedPhone = property.contact_phone.replace(/\D/g, "");
    const phoneWithCountry = formattedPhone.startsWith("91")
      ? formattedPhone
      : `91${formattedPhone}`;
    const whatsappUrl = `https://wa.me/${phoneWithCountry}?text=Hi, I am interested in your property: ${property.title} at ${property.location}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div
      className={`min-h-screen ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {shareStatus.show && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all duration-300 ${
              shareStatus.type === "success"
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            }`}
          >
            {shareStatus.type === "success" ? (
              <Check size={18} className="text-green-600 dark:text-green-400" />
            ) : (
              <X size={18} className="text-red-600 dark:text-red-400" />
            )}
            <span>{shareStatus.message}</span>
          </div>
        )}
        <div className="mb-6">
          <button
            onClick={() => navigate("/dashboard/properties")}
            className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
              isDark
                ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                : "bg-white hover:bg-gray-100 text-gray-700 shadow-sm"
            }`}
          >
            <ArrowLeft size={16} /> Back to Properties
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-gray-500 dark:text-gray-400">
                <MapPin size={16} />
                <p>{property.location}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleShare}
                disabled={printStatus.loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-100 shadow-sm"
                } ${
                  printStatus.loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Share2 size={16} />{" "}
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={handleSave}
                disabled={printStatus.loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  isSaved
                    ? isDark
                      ? "bg-blue-900/30 text-blue-400"
                      : "bg-blue-50 text-blue-600"
                    : isDark
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-100 shadow-sm"
                } ${
                  printStatus.loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Heart size={16} fill={isSaved ? "currentColor" : "none"} />{" "}
                <span className="hidden sm:inline">
                  {isSaved ? "Saved" : "Save"}
                </span>
              </button>
              <button
                onClick={handlePrint}
                disabled={printStatus.loading}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                  isDark
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-white hover:bg-gray-100 shadow-sm"
                } ${
                  printStatus.loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {printStatus.loading ? (
                  <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                ) : (
                  <Printer size={16} />
                )}
                <span className="hidden sm:inline">
                  {printStatus.loading ? "Generating..." : "Print"}
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 space-y-6">
            <div
              className={`rounded-xl overflow-hidden ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-sm`}
            >
              <div className="relative">
                <div className="aspect-[16/9] overflow-hidden">
                  <img
                    src={mainImage || "/placeholder.svg"}
                    alt={property?.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg";
                    }}
                  />
                </div>
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                      property.status
                    )}`}
                  >
                    {capitalizeAndFormatDisplayValue(property.status)}
                  </span>
                  {isNewProperty() && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                      New
                    </span>
                  )}
                </div>
                <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {capitalizeAndFormatDisplayValue(property.property_type)}
                </span>
              </div>
              {property.images && property.images.length > 1 && (
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">
                      Property Photos ({property.images.length})
                    </h3>
                    <button
                      onClick={() => setShowAllThumbnails(!showAllThumbnails)}
                      className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {showAllThumbnails ? "Show Less" : "Show All"}
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {property.images
                      .slice(0, showAllThumbnails ? property.images.length : 5)
                      .map((image, index) => (
                        <div
                          key={image.id || index}
                          className={`cursor-pointer rounded-lg overflow-hidden aspect-square border-2 transition-all ${
                            activeImage === index
                              ? "border-blue-500 scale-[0.98]"
                              : isDark
                              ? "border-gray-700 hover:border-gray-500"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                          onClick={() => setActiveImage(index)}
                        >
                          <img
                            src={
                              typeof propertyService.getImageUrl === "function"
                                ? propertyService.getImageUrl(image.image)
                                : image.image
                            }
                            alt={`${property.title} - ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = "/placeholder.svg";
                            }}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className={`rounded-xl p-6 ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-sm`}
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span
                  className={`w-8 h-8 rounded-full ${
                    isDark
                      ? "bg-blue-900/50 text-blue-400"
                      : "bg-blue-100 text-blue-600"
                  } flex items-center justify-center`}
                >
                  <Home size={16} />
                </span>
                Property Overview
              </h2>
              <div className="prose dark:prose-invert max-w-none">
                <p className="whitespace-pre-line">
                  {property.description || "No description available."}
                </p>
              </div>
            </div>

            {/* Property Details Section */}
            <div
              className={`rounded-xl p-6 ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-sm`}
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span
                  className={`w-8 h-8 rounded-full ${
                    isDark
                      ? "bg-blue-900/50 text-blue-400"
                      : "bg-blue-100 text-blue-600"
                  } flex items-center justify-center`}
                >
                  <Briefcase size={16} />
                </span>
                Property Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 border-gray-200 dark:border-gray-700">
                    Basic Information
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-start pt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Property Type
                      </span>
                      <span className="font-medium text-sm text-right">
                        {capitalizeAndFormatDisplayValue(
                          property.property_type
                        )}
                      </span>
                    </li>
                    <li className="flex justify-between items-start pt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Property Sub-Type
                      </span>
                      <span className="font-medium text-sm text-right">
                        {capitalizeAndFormatDisplayValue(
                          property.property_sub_type
                        )}
                      </span>
                    </li>
                    <li className="flex justify-between items-start pt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Listing Type
                      </span>
                      <span className="font-medium text-sm text-right">
                        {capitalizeAndFormatDisplayValue(property.listing_type)}
                      </span>
                    </li>
                    <li className="flex justify-between items-start pt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Status
                      </span>
                      <span
                        className={`font-medium px-2 py-0.5 rounded-full text-xs text-right ${getStatusTextClass(
                          property.status || "N/A"
                        )}`}
                      >
                        {capitalizeAndFormatDisplayValue(property.status)}
                      </span>
                    </li>
                    {property.created_at && (
                      <li className="flex justify-between items-start pt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Listed On
                        </span>
                        <span className="font-medium text-sm text-right">
                          {formatDate(property.created_at)}
                        </span>
                      </li>
                    )}
                    <li className="flex justify-between items-start pt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Floor
                      </span>
                      <span className="font-medium text-sm text-right">
                        {capitalizeAndFormatDisplayValue(property.floor)}
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 border-gray-200 dark:border-gray-700">
                    Area & Dimensions
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-start pt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Total Area
                      </span>
                      <span className="font-medium text-sm text-right">
                        {property.area ? `${property.area} sq.ft` : "N/A"}
                      </span>
                    </li>
                    <li className="flex justify-between items-start pt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Carpet Area
                      </span>
                      <span className="font-medium text-sm text-right">
                        {property.carpet_area
                          ? `${property.carpet_area} sq.ft`
                          : "N/A"}
                      </span>
                    </li>
                    {property.dimensions_length && property.dimensions_width ? (
                      <li className="flex justify-between items-start pt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Dimensions
                        </span>
                        <span className="font-medium text-sm text-right">
                          {property.dimensions_length} ×{" "}
                          {property.dimensions_width} ft
                        </span>
                      </li>
                    ) : (
                      <li className="flex justify-between items-start pt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Dimensions
                        </span>
                        <span className="font-medium text-sm text-right">
                          N/A
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2 border-gray-200 dark:border-gray-700">
                    Features & Possession
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between items-start pt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Facing
                      </span>
                      <span className="font-medium text-sm text-right">
                        {capitalizeAndFormatDisplayValue(property.facing)}
                      </span>
                    </li>
                    <li className="flex justify-between items-start pt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Furnishing
                      </span>
                      <span className="font-medium text-sm text-right">
                        {capitalizeAndFormatDisplayValue(
                          property.furnishing_status
                        )}
                      </span>
                    </li>
                    <li className="flex justify-between items-start pt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Age of Property
                      </span>
                      <span className="font-medium text-sm text-right">
                        {capitalizeAndFormatDisplayValue(
                          property.age_of_property
                        )}
                      </span>
                    </li>
                    <li className="flex justify-between items-start pt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Balconies
                      </span>
                      <span className="font-medium text-sm text-right">
                        {capitalizeAndFormatDisplayValue(property.balconies)}
                      </span>
                    </li>
                    <li className="flex justify-between items-start pt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Possession Status
                      </span>
                      <span className="font-medium text-sm text-right">
                        {capitalizeAndFormatDisplayValue(
                          property.possession_status
                        )}
                      </span>
                    </li>
                    {property.possession_timeline && (
                      <li className="flex justify-between items-start pt-1">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Possession Timeline
                        </span>
                        <span className="font-medium text-sm text-right">
                          {capitalizeAndFormatDisplayValue(
                            property.possession_timeline
                          )}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Amenities Section - NEW */}
            {property.amenities && property.amenities.length > 0 && (
              <div
                className={`rounded-xl p-6 ${
                  isDark ? "bg-gray-800" : "bg-white"
                } shadow-sm`}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-full ${
                      isDark
                        ? "bg-blue-900/50 text-blue-400"
                        : "bg-blue-100 text-blue-600"
                    } flex items-center justify-center`}
                  >
                    <Zap size={16} />
                  </span>
                  Amenities
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                        isDark ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <Check
                        size={16}
                        className={isDark ? "text-green-400" : "text-green-600"}
                      />
                      <span className="font-medium">
                        {capitalizeAndFormatDisplayValue(amenity.name)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specifications Section - NEW */}
            {property.specifications && property.specifications.length > 0 && (
              <div
                className={`rounded-xl p-6 ${
                  isDark ? "bg-gray-800" : "bg-white"
                } shadow-sm`}
              >
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span
                    className={`w-8 h-8 rounded-full ${
                      isDark
                        ? "bg-blue-900/50 text-blue-400"
                        : "bg-blue-100 text-blue-600"
                    } flex items-center justify-center`}
                  >
                    <ListChecks size={16} />
                  </span>
                  Specifications
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {property.specifications.map((spec) => (
                    <div
                      key={spec.id}
                      className={`p-3 rounded-lg ${
                        isDark ? "bg-gray-700/50" : "bg-gray-50"
                      }`}
                    >
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {capitalizeAndFormatDisplayValue(spec.key)}
                      </p>
                      <p className="font-semibold">
                        {capitalizeAndFormatDisplayValue(spec.value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>{" "}
          {/* End of Left Column */}
          {/* Right Column (Sticky) */}
          <div className="space-y-6">
            <div
              className={`rounded-xl p-6 ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow-sm sticky top-6`}
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Price
                  </p>
                  <div className="text-3xl font-bold">
                    ₹{formatPrice(property.price)}
                  </div>
                </div>
                {property.price_per_sqft && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Price per sq.ft
                    </p>
                    <div className="font-semibold">
                      ₹{formatPrice(property.price_per_sqft)}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div
                  className={`flex flex-col items-center p-3 rounded-lg ${
                    isDark ? "bg-gray-700" : "bg-gray-50"
                  }`}
                >
                  <Maximize
                    className={`${
                      isDark ? "text-blue-400" : "text-blue-600"
                    } mb-1`}
                    size={20}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Area
                  </span>
                  <span className="font-semibold">{property.area} sq.ft</span>
                </div>
                {property.property_sub_type && (
                  <div
                    className={`flex flex-col items-center p-3 rounded-lg ${
                      isDark ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <Home
                      className={`${
                        isDark ? "text-blue-400" : "text-blue-600"
                      } mb-1`}
                      size={20}
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Type
                    </span>
                    <span className="font-semibold">
                      {capitalizeAndFormatDisplayValue(
                        property.property_sub_type
                      )}
                    </span>
                  </div>
                )}
                {property.furnishing_status && (
                  <div
                    className={`flex flex-col items-center p-3 rounded-lg ${
                      isDark ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <DollarSign
                      className={`${
                        isDark ? "text-blue-400" : "text-blue-600"
                      } mb-1`}
                      size={20}
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Furnishing
                    </span>
                    <span className="font-semibold">
                      {capitalizeAndFormatDisplayValue(
                        property.furnishing_status
                      )}
                    </span>
                  </div>
                )}
                {property.facing && (
                  <div
                    className={`flex flex-col items-center p-3 rounded-lg ${
                      isDark ? "bg-gray-700" : "bg-gray-50"
                    }`}
                  >
                    <Compass
                      className={`${
                        isDark ? "text-blue-400" : "text-blue-600"
                      } mb-1`}
                      size={20}
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Facing
                    </span>
                    <span className="font-semibold">
                      {capitalizeAndFormatDisplayValue(property.facing)}
                    </span>
                  </div>
                )}
              </div>
              {property.possession_timeline && (
                <div
                  className={`mb-6 p-3 rounded-lg ${
                    isDark ? "bg-blue-900/30" : "bg-blue-50"
                  } flex items-center gap-3`}
                >
                  <Clock
                    className={`${
                      isDark ? "text-blue-400" : "text-blue-600"
                    } flex-shrink-0`}
                    size={20}
                  />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Possession Timeline
                    </p>
                    <p
                      className={`font-medium ${
                        isDark ? "text-blue-300" : "text-blue-700"
                      }`}
                    >
                      {capitalizeAndFormatDisplayValue(
                        property.possession_timeline
                      )}
                    </p>
                  </div>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-6">
                <h3 className="font-semibold mb-4">Builder Information</h3>
                {property.contact_name && (
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-8 h-8 rounded-full ${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } flex items-center justify-center flex-shrink-0`}
                    >
                      <User
                        size={16}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Builder Contact
                      </p>
                      <p className="font-medium">{property.contact_name}</p>
                    </div>
                  </div>
                )}
                {property.contact_phone && (
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-8 h-8 rounded-full ${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } flex items-center justify-center flex-shrink-0`}
                    >
                      <Phone
                        size={16}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Phone
                      </p>
                      <p className="font-medium">{property.contact_phone}</p>
                    </div>
                  </div>
                )}
                {property.created_at && (
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full ${
                        isDark ? "bg-gray-700" : "bg-gray-100"
                      } flex items-center justify-center flex-shrink-0`}
                    >
                      <Calendar
                        size={16}
                        className="text-gray-500 dark:text-gray-400"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Listed On
                      </p>
                      <p className="font-medium">
                        {formatDate(property.created_at)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleWhatsAppRedirect}
                  disabled={!property.contact_phone}
                  className={`w-full py-3 ${
                    property.contact_phone
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  } text-white rounded-lg transition duration-200 flex items-center justify-center gap-2 font-medium`}
                >
                  <Phone size={18} />
                  {property.contact_phone
                    ? "Contact on WhatsApp"
                    : "No contact number available"}
                </button>
                <button
                  onClick={handleSave}
                  className={`w-full py-3 border rounded-lg transition duration-200 flex items-center justify-center gap-2 font-medium ${
                    isSaved
                      ? isDark
                        ? "border-blue-500 bg-blue-900/20 text-blue-400"
                        : "border-blue-600 bg-blue-50 text-blue-600"
                      : isDark
                      ? "border-blue-600 text-blue-400 hover:bg-blue-900/20"
                      : "border-blue-600 text-blue-600 hover:bg-blue-50"
                  }`}
                >
                  <Heart size={18} fill={isSaved ? "currentColor" : "none"} />
                  {isSaved ? "Saved to Favorites" : "Save to Favorites"}
                </button>
              </div>
            </div>
          </div>{" "}
          {/* End of Right Column */}
        </div>{" "}
        {/* End of Main Content Grid */}
      </div>{" "}
      {/* End of Container */}
    </div>
  );
};

export default PropertyDetail;
