// import { useState, useEffect, useRef } from "react";
// import "react-datepicker/dist/react-datepicker.css";
// import { useTheme } from "../../context/ThemeContext";
// import {
//   Search,
//   X,
//   Loader2,
//   User,
//   Home,
//   Calendar,
//   Users,
//   FileText,
//   LayoutDashboard,
//   BarChart3,
//   Bell,
// } from "lucide-react";
// import SearchResultModal from "./SearchResultModal";
// import LeadService from "../../services/leadService";
// import propertyService from "../../services/propertyService";
// import UserService from "../../services/UserService";
// import siteVisitService from "../../services/siteVisitService";
// // Import the new Reminders component
// import Reminders from './Reminders';

// const Navbar = () => {
//   const { theme } = useTheme();
//   const isDark = theme === "dark";

//   // State for showing/hiding popups
//   const [showRemindersPopup, setShowRemindersPopup] = useState(false);
//   const [showResults, setShowResults] = useState(false);

//   // All state related to search (unchanged)
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState([]);
//   const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
//   const [isFiltering, setIsFiltering] = useState(false);
//   const [recentSearches, setRecentSearches] = useState([]);
//   const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
//   const [allSearchableData, setAllSearchableData] = useState([]);
//   const [searchCategories, setSearchCategories] = useState({
//     lead: true,
//     property: true,
//     task: true,
//     user: true,
//     dashboard: true,
//     analytics: true,
//   });
//   const [selectedResult, setSelectedResult] = useState(null);
//   const [showResultModal, setShowResultModal] = useState(false);

//   // Refs for popups
//   const searchRef = useRef(null);
//   const searchInputRef = useRef(null);
//   const resultsRef = useRef(null);
//   const remindersRef = useRef(null); // Ref for the entire reminders section (li)

//   // Data fetching and all search-related functions remain unchanged
//   useEffect(() => {
//     const fetchAllData = async () => {
//       setIsFetchingInitialData(true);
//       try {
//         const [
//           leadsResponse,
//           propertiesResponse,
//           usersResponse,
//           siteVisitsResponse,
//         ] = await Promise.all([
//           LeadService.getLeads({ page_size: 1000 }),
//           propertyService.getProperties(),
//           UserService.getUsers(),
//           siteVisitService.getAllSiteVisits(),
//         ]);

//         const formattedLeads = (leadsResponse?.results || []).map((lead) => ({
//           id: lead.id,
//           type: "lead",
//           title: lead.name || "Untitled Lead",
//           description: `Email: ${lead.email || "N/A"}, Phone: ${
//             lead.phone || "N/A"
//           }`,
//           url: `/dashboard/leads/${lead.id}`,
//           originalData: lead,
//         }));

//         const formattedProperties = (propertiesResponse || []).map(
//           (property) => ({
//             id: property.id,
//             type: "property",
//             title: property.title || "Untitled Property",
//             description:
//               property.location ||
//               property.property_type ||
//               "No specific details",
//             url: `/dashboard/properties/${property.id}`,
//             originalData: property,
//           })
//         );

//         const formattedUsers = (usersResponse || []).map((user) => ({
//           id: user.id,
//           type: "user",
//           title:
//             user.username ||
//             `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
//             "Unnamed User",
//           description: user.email || user.role || "No role/email specified",
//           url: `/dashboard/team`,
//           originalData: user,
//         }));

//         const siteVisitsData =
//           siteVisitsResponse?.results || siteVisitsResponse || [];
//         const formattedSiteVisits = siteVisitsData.map((visit) => ({
//           id: visit.id,
//           type: "task",
//           title: `Visit: ${visit.property_details?.title || "N/A"} with ${
//             visit.client_details?.full_name ||
//             visit.client_details?.username ||
//             visit.client_name_manual ||
//             "N/A Client"
//           }`,
//           description: `Status: ${visit.status || "N/A"}, Date: ${
//             visit.date ? new Date(visit.date).toLocaleDateString() : "N/A"
//           }`,
//           url: `/dashboard/site-visits`,
//           originalData: visit,
//         }));

//         const staticPages = [
//           {
//             id: "dashboard-main",
//             type: "dashboard",
//             title: "Dashboard Overview",
//             description: "Main dashboard.",
//             url: "/dashboard",
//           },
//           {
//             id: "analytics-reports",
//             type: "analytics",
//             title: "Analytics & Reports",
//             description: "View reports.",
//             url: "/dashboard/analytics",
//           },
//         ];

//         setAllSearchableData([
//           ...formattedLeads,
//           ...formattedProperties,
//           ...formattedUsers,
//           ...formattedSiteVisits,
//           ...staticPages,
//         ]);
//       } catch (error) {
//         console.error("Error fetching data for search:", error);
//       } finally {
//         setIsFetchingInitialData(false);
//       }
//     };
//     fetchAllData();
//   }, []);

//   const toggleRemindersPopup = () => setShowRemindersPopup((prev) => !prev);
//   const handleSearchChange = (e) => {
//     const query = e.target.value;
//     setSearchQuery(query);
//     setSelectedResultIndex(-1);

//     if (query.trim().length > 0) {
//       setShowResults(true);
//       setIsFiltering(true);
//       const lowerCaseQuery = query.toLowerCase();
//       const filtered = allSearchableData.filter((item) => {
//         const matchesQuery =
//           (item.title && item.title.toLowerCase().includes(lowerCaseQuery)) ||
//           (item.description &&
//             item.description.toLowerCase().includes(lowerCaseQuery));
//         const categoryEnabled = item.type && searchCategories[item.type];
//         return matchesQuery && categoryEnabled;
//       });
//       setSearchResults(filtered);
//       setIsFiltering(false);
//     } else {
//       setShowResults(false);
//       setSearchResults([]);
//       setIsFiltering(false);
//     }
//   };
//   const handleSearchSubmit = (e) => {
//     e.preventDefault();
//     if (!searchQuery.trim()) return;
//     if (!recentSearches.includes(searchQuery.trim())) {
//       const newRecentSearches = [
//         searchQuery.trim(),
//         ...recentSearches.slice(0, 4),
//       ];
//       setRecentSearches(newRecentSearches);
//       localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
//     }
//     if (
//       selectedResultIndex >= 0 &&
//       selectedResultIndex < searchResults.length
//     ) {
//       navigateToResult(searchResults[selectedResultIndex]);
//     } else if (searchResults.length > 0) {
//       navigateToResult(searchResults[0]);
//     }
//   };
//   const navigateToResult = (result) => {
//     if (!result) return;
//     if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
//       const newRecentSearches = [
//         searchQuery.trim(),
//         ...recentSearches.slice(0, 4),
//       ];
//       setRecentSearches(newRecentSearches);
//       localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
//     }
//     setSelectedResult(result);
//     setShowResultModal(true);
//     setShowResults(false);
//   };
//   const clearSearch = () => {
//     setSearchQuery("");
//     setSearchResults([]);
//     setShowResults(false);
//     setSelectedResultIndex(-1);
//     setIsFiltering(false);
//     searchInputRef.current?.focus();
//   };
//   const toggleCategory = (category) => {
//     const nextCategoryState = !searchCategories[category];
//     setSearchCategories((prev) => ({ ...prev, [category]: nextCategoryState }));
//     if (searchQuery.trim()) {
//       setIsFiltering(true);
//       const lowerCaseQuery = searchQuery.toLowerCase();
//       const tempUpdatedCategories = {
//         ...searchCategories,
//         [category]: nextCategoryState,
//       };
//       const filtered = allSearchableData.filter((item) => {
//         const matchesQuery =
//           (item.title && item.title.toLowerCase().includes(lowerCaseQuery)) ||
//           (item.description &&
//             item.description.toLowerCase().includes(lowerCaseQuery));
//         const categoryEnabled = item.type && tempUpdatedCategories[item.type];
//         return matchesQuery && categoryEnabled;
//       });
//       setSearchResults(filtered);
//       setIsFiltering(false);
//     }
//   };
//   const handleKeyDown = (e) => {
//     if (!showResults || searchResults.length === 0) return;
//     if (e.key === "ArrowDown") {
//       e.preventDefault();
//       const newIndex = Math.min(
//         selectedResultIndex + 1,
//         searchResults.length - 1
//       );
//       setSelectedResultIndex(newIndex);
//       resultsRef.current
//         ?.querySelectorAll("li button")
//         [newIndex]?.scrollIntoView({ block: "nearest" });
//     } else if (e.key === "ArrowUp") {
//       e.preventDefault();
//       const newIndex = Math.max(selectedResultIndex - 1, 0);
//       setSelectedResultIndex(newIndex);
//       resultsRef.current
//         ?.querySelectorAll("li button")
//         [newIndex]?.scrollIntoView({ block: "nearest" });
//     } else if (e.key === "Enter" && selectedResultIndex >= 0) {
//       e.preventDefault();
//       navigateToResult(searchResults[selectedResultIndex]);
//     } else if (e.key === "Escape") {
//       setShowResults(false);
//     }
//   };
//   const getTypeIcon = (type) => {
//     const iconProps = { size: 18, className: "flex-shrink-0" };
//     switch (type) {
//       case "lead":
//         return <User {...iconProps} className={`${iconProps.className} text-blue-500`} />;
//       case "property":
//         return <Home {...iconProps} className={`${iconProps.className} text-green-500`} />;
//       case "task":
//         return <Calendar {...iconProps} className={`${iconProps.className} text-orange-500`} />;
//       case "user":
//         return <Users {...iconProps} className={`${iconProps.className} text-purple-500`} />;
//       case "dashboard":
//         return <LayoutDashboard {...iconProps} className={`${iconProps.className} text-indigo-500`} />;
//       case "analytics":
//         return <BarChart3 {...iconProps} className={`${iconProps.className} text-pink-500`} />;
//       default:
//         return <FileText {...iconProps} className={`${iconProps.className} text-gray-500`} />;
//     }
//   };

//   useEffect(() => {
//     const savedSearches = localStorage.getItem("recentSearches");
//     if (savedSearches) {
//       try {
//         setRecentSearches(JSON.parse(savedSearches));
//       } catch (e) {
//         localStorage.removeItem("recentSearches");
//       }
//     }
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (searchRef.current && !searchRef.current.contains(event.target)) {
//         setShowResults(false);
//       }
//       if (remindersRef.current && !remindersRef.current.contains(event.target)) {
//         setShowRemindersPopup(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <>
//       <nav
//         className={`w-full px-4.5 py-5.5 border-b ${
//           isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
//         }`}
//       >
//         <div className="relative flex items-center justify-end gap-4">
//           <div
//             ref={searchRef}
//             className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-md hidden md:block"
//           >
//             <form onSubmit={handleSearchSubmit} className="relative">
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                   <Search
//                     size={16}
//                     className={isDark ? "text-gray-400" : "text-gray-500"}
//                   />
//                 </div>
//                 <input
//                   ref={searchInputRef}
//                   type="search"
//                   value={searchQuery}
//                   onChange={handleSearchChange}
//                   onKeyDown={handleKeyDown}
//                   onFocus={() =>
//                     searchQuery &&
//                     searchResults.length > 0 &&
//                     setShowResults(true)
//                   }
//                   placeholder="Search Leads, Properties, Tasks..."
//                   className={`w-full pl-10 pr-10 py-2 rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
//                     isDark
//                       ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400"
//                       : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"
//                   } ${
//                     showResults
//                       ? isDark
//                         ? "rounded-b-none border-b-transparent"
//                         : "rounded-b-none border-b-transparent"
//                       : ""
//                   }`}
//                 />
//                 {searchQuery && (
//                   <div className="absolute inset-y-0 right-0 flex items-center pr-3">
//                     {isFiltering ? (
//                       <Loader2
//                         size={16}
//                         className="animate-spin text-gray-400"
//                       />
//                     ) : (
//                       <button
//                         type="button"
//                         onClick={clearSearch}
//                         className="text-gray-400 hover:text-gray-500"
//                         aria-label="Clear search"
//                       >
//                         <X size={16} />
//                       </button>
//                     )}
//                   </div>
//                 )}
//               </div>

//               {showResults && (
//                 <div
//                   className={`absolute z-[100] w-full mt-0 overflow-hidden rounded-b-md shadow-lg border ${
//                     isDark
//                       ? "bg-gray-800 border-gray-700"
//                       : "bg-white border-gray-300"
//                   }`}
//                 >
//                   <div className={`px-3 py-2 flex flex-wrap gap-2 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
//                     {Object.keys(searchCategories).map((categoryKey) => (
//                       <button
//                         key={categoryKey}
//                         type="button"
//                         onClick={() => toggleCategory(categoryKey)}
//                         className={`px-2.5 py-1 text-xs rounded-full flex items-center gap-1.5 transition-colors ${
//                           searchCategories[categoryKey]
//                             ? isDark
//                               ? `bg-${getTypeIcon(categoryKey).props.className.split("-")[1]}-900/30 text-${getTypeIcon(categoryKey).props.className.split("-")[1]}-300`
//                               : `bg-${getTypeIcon(categoryKey).props.className.split("-")[1]}-100 text-${getTypeIcon(categoryKey).props.className.split("-")[1]}-800`
//                             : isDark
//                             ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
//                             : "bg-gray-200 text-gray-500 hover:bg-gray-300"
//                         }`}
//                       >
//                         {getTypeIcon(categoryKey)}
//                         {categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}s
//                       </button>
//                     ))}
//                   </div>
//                   {isFetchingInitialData ? (
//                     <div className={`p-4 text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
//                       <Loader2 size={20} className="animate-spin mx-auto mb-2" />
//                       Loading data...
//                     </div>
//                   ) : searchResults.length > 0 ? (
//                     <ul ref={resultsRef} className="max-h-96 overflow-y-auto">
//                       {searchResults.map((result, index) => (
//                         <li key={`${result.type}-${result.id}-${index}`}>
//                           <button
//                             type="button"
//                             onClick={() => navigateToResult(result)}
//                             onMouseEnter={() => setSelectedResultIndex(index)}
//                             className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-150 ${
//                               selectedResultIndex === index
//                                 ? isDark
//                                   ? "bg-blue-900/60"
//                                   : "bg-blue-100"
//                                 : isDark
//                                 ? "hover:bg-gray-700"
//                                 : "hover:bg-gray-50"
//                             } ${
//                               index < searchResults.length - 1
//                                 ? isDark
//                                   ? "border-b border-gray-700"
//                                   : "border-b border-gray-200"
//                                 : ""
//                             }`}
//                           >
//                             {getTypeIcon(result.type)}
//                             <div className="min-w-0 flex-1">
//                               <div className={`font-medium truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>
//                                 {result.title}
//                               </div>
//                               <div className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
//                                 {result.description}
//                               </div>
//                             </div>
//                           </button>
//                         </li>
//                       ))}
//                     </ul>
//                   ) : searchQuery.trim() ? (
//                     <div className={`p-4 text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
//                       No results found for "{searchQuery}".
//                       <button
//                         type="button"
//                         className={`block mx-auto mt-2 text-sm ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
//                         onClick={() => {
//                           const allCatsTrue = Object.keys(searchCategories).reduce((acc, key) => ({ ...acc, [key]: true }), {});
//                           setSearchCategories(allCatsTrue);
//                           const lowerCaseQuery = searchQuery.toLowerCase();
//                           setIsFiltering(true);
//                           const filtered = allSearchableData.filter(
//                             (item) =>
//                               (item.title && item.title.toLowerCase().includes(lowerCaseQuery)) ||
//                               (item.description && item.description.toLowerCase().includes(lowerCaseQuery))
//                           );
//                           setSearchResults(filtered);
//                           setIsFiltering(false);
//                         }}
//                       >
//                         Try searching all categories
//                       </button>
//                     </div>
//                   ) : recentSearches.length > 0 && !isFetchingInitialData ? (
//                     <div>
//                       <div className={`px-4 py-2 text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
//                         Recent Searches
//                       </div>
//                       <ul>
//                         {recentSearches.map((search, index) => (
//                           <li key={index}>
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 setSearchQuery(search);
//                                 handleSearchChange({ target: { value: search } });
//                               }}
//                               className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150 ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"}`}
//                             >
//                               <Search size={14} className="opacity-70" />
//                               {search}
//                             </button>
//                           </li>
//                         ))}
//                       </ul>
//                     </div>
//                   ) : (
//                     <div className={`p-4 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
//                       Start typing to search...
//                     </div>
//                   )}
//                   <div className={`px-4 py-2 text-xs border-t ${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}>
//                     <p className="flex items-center gap-1">
//                       <kbd className={`px-1.5 py-0.5 text-xs rounded ${isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"}`}>↑</kbd>
//                       <kbd className={`px-1.5 py-0.5 text-xs rounded ${isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"}`}>↓</kbd>
//                       to navigate,
//                       <kbd className={`px-1.5 py-0.5 text-xs rounded ${isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"}`}>Enter</kbd>
//                       to select
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </form>
//           </div>

//           <ul className="hidden md:flex items-center gap-6 text-sm">
//             <li className={`font-bold hover:text-blue-500 cursor-pointer ${isDark ? "text-gray-300" : "text-gray-700"}`}>
//               Team
//             </li>
//             <li className="relative" ref={remindersRef}>
//               <button
//                 onClick={toggleRemindersPopup}
//                 className={`p-1 rounded-full ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
//               >
//                 <Bell size={20} className={isDark ? "text-gray-300" : "text-gray-700"} />
//               </button>
//               {showRemindersPopup && (
//                 <div className="absolute top-full mt-2 right-0 z-[100] max-h-[85vh]">
//                   <Reminders isDark={isDark} />
//                 </div>
//               )}
//             </li>
//           </ul>
//           <button
//             className="md:hidden text-gray-500 hover:text-blue-500"
//             aria-label="Search"
//             onClick={() => {
//               console.warn("Mobile search UI toggle to be implemented.");
//             }}
//           >
//             <Search size={20} />
//           </button>
//         </div>
//       </nav>

//       <SearchResultModal
//         isOpen={showResultModal}
//         onClose={() => setShowResultModal(false)}
//         result={selectedResult}
//       />
//     </>
//   );
// };

// export default Navbar;



import { useState, useEffect, useRef } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useTheme } from "../../context/ThemeContext";
import {
  Search,
  X,
  Loader2,
  User,
  Home,
  Calendar,
  Users,
  FileText,
  LayoutDashboard,
  BarChart3,
  Bell,
} from "lucide-react";
import SearchResultModal from "./SearchResultModal";
import LeadService from "../../services/leadService";
import propertyService from "../../services/propertyService";
import UserService from "../../services/UserService";
import siteVisitService from "../../services/siteVisitService";
// Import the new Reminders component
import Reminders from './Reminders';

const Navbar = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // State for showing/hiding popups
  const [showRemindersPopup, setShowRemindersPopup] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // All state related to search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isFetchingInitialData, setIsFetchingInitialData] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const [allSearchableData, setAllSearchableData] = useState([]);
  const [searchCategories, setSearchCategories] = useState({
    lead: true,
    property: true,
    task: true,
    user: true,
    dashboard: true,
    analytics: true,
  });
  const [selectedResult, setSelectedResult] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Refs for popups
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);
  const remindersRef = useRef(null);

  // Data fetching (unchanged)
  useEffect(() => {
    const fetchAllData = async () => {
      setIsFetchingInitialData(true);
      try {
        const [
          leadsResponse,
          propertiesResponse,
          usersResponse,
          siteVisitsResponse,
        ] = await Promise.all([
          LeadService.getLeads({ page_size: 1000 }),
          propertyService.getProperties(),
          UserService.getUsers(),
          siteVisitService.getAllSiteVisits(),
        ]);

        const formattedLeads = (leadsResponse?.results || []).map((lead) => ({
          id: lead.id,
          type: "lead",
          title: lead.name || "Untitled Lead",
          description: `Email: ${lead.email || "N/A"}, Phone: ${
            lead.phone || "N/A"
          }`,
          url: `/dashboard/leads/${lead.id}`,
          originalData: lead,
        }));

        const formattedProperties = (propertiesResponse || []).map(
          (property) => ({
            id: property.id,
            type: "property",
            title: property.title || "Untitled Property",
            description:
              property.location ||
              property.property_type ||
              "No specific details",
            url: `/dashboard/properties/${property.id}`,
            originalData: property,
          })
        );

        const formattedUsers = (usersResponse || []).map((user) => ({
          id: user.id,
          type: "user",
          title:
            user.username ||
            `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
            "Unnamed User",
          description: user.email || user.role || "No role/email specified",
          url: `/dashboard/team`,
          originalData: user,
        }));

        const siteVisitsData =
          siteVisitsResponse?.results || siteVisitsResponse || [];
        const formattedSiteVisits = siteVisitsData.map((visit) => ({
          id: visit.id,
          type: "task",
          title: `Visit: ${visit.property_details?.title || "N/A"} with ${
            visit.client_details?.full_name ||
            visit.client_details?.username ||
            visit.client_name_manual ||
            "N/A Client"
          }`,
          description: `Status: ${visit.status || "N/A"}, Date: ${
            visit.date ? new Date(visit.date).toLocaleDateString() : "N/A"
          }`,
          url: `/dashboard/site-visits`,
          originalData: visit,
        }));

        const staticPages = [
          {
            id: "dashboard-main",
            type: "dashboard",
            title: "Dashboard Overview",
            description: "Main dashboard.",
            url: "/dashboard",
          },
          {
            id: "analytics-reports",
            type: "analytics",
            title: "Analytics & Reports",
            description: "View reports.",
            url: "/dashboard/analytics",
          },
        ];

        setAllSearchableData([
          ...formattedLeads,
          ...formattedProperties,
          ...formattedUsers,
          ...formattedSiteVisits,
          ...staticPages,
        ]);
      } catch (error) {
        console.error("Error fetching data for search:", error);
      } finally {
        setIsFetchingInitialData(false);
      }
    };
    fetchAllData();
  }, []);
  
  // All other functions (unchanged)
  const toggleRemindersPopup = () => setShowRemindersPopup((prev) => !prev);
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setSelectedResultIndex(-1);

    if (query.trim().length > 0) {
      setShowResults(true);
      setIsFiltering(true);
      const lowerCaseQuery = query.toLowerCase();
      const filtered = allSearchableData.filter((item) => {
        const matchesQuery =
          (item.title && item.title.toLowerCase().includes(lowerCaseQuery)) ||
          (item.description &&
            item.description.toLowerCase().includes(lowerCaseQuery));
        const categoryEnabled = item.type && searchCategories[item.type];
        return matchesQuery && categoryEnabled;
      });
      setSearchResults(filtered);
      setIsFiltering(false);
    } else {
      setShowResults(false);
      setSearchResults([]);
      setIsFiltering(false);
    }
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (!recentSearches.includes(searchQuery.trim())) {
      const newRecentSearches = [
        searchQuery.trim(),
        ...recentSearches.slice(0, 4),
      ];
      setRecentSearches(newRecentSearches);
      localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
    }
    if (
      selectedResultIndex >= 0 &&
      selectedResultIndex < searchResults.length
    ) {
      navigateToResult(searchResults[selectedResultIndex]);
    } else if (searchResults.length > 0) {
      navigateToResult(searchResults[0]);
    }
  };
  const navigateToResult = (result) => {
    if (!result) return;
    if (searchQuery.trim() && !recentSearches.includes(searchQuery.trim())) {
      const newRecentSearches = [
        searchQuery.trim(),
        ...recentSearches.slice(0, 4),
      ];
      setRecentSearches(newRecentSearches);
      localStorage.setItem("recentSearches", JSON.stringify(newRecentSearches));
    }
    setSelectedResult(result);
    setShowResultModal(true);
    setShowResults(false);
  };
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setSelectedResultIndex(-1);
    setIsFiltering(false);
    searchInputRef.current?.focus();
  };
  const toggleCategory = (category) => {
    const nextCategoryState = !searchCategories[category];
    setSearchCategories((prev) => ({ ...prev, [category]: nextCategoryState }));
    if (searchQuery.trim()) {
      setIsFiltering(true);
      const lowerCaseQuery = searchQuery.toLowerCase();
      const tempUpdatedCategories = {
        ...searchCategories,
        [category]: nextCategoryState,
      };
      const filtered = allSearchableData.filter((item) => {
        const matchesQuery =
          (item.title && item.title.toLowerCase().includes(lowerCaseQuery)) ||
          (item.description &&
            item.description.toLowerCase().includes(lowerCaseQuery));
        const categoryEnabled = item.type && tempUpdatedCategories[item.type];
        return matchesQuery && categoryEnabled;
      });
      setSearchResults(filtered);
      setIsFiltering(false);
    }
  };
  const handleKeyDown = (e) => {
    if (!showResults || searchResults.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const newIndex = Math.min(
        selectedResultIndex + 1,
        searchResults.length - 1
      );
      setSelectedResultIndex(newIndex);
      resultsRef.current
        ?.querySelectorAll("li button")
        [newIndex]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const newIndex = Math.max(selectedResultIndex - 1, 0);
      setSelectedResultIndex(newIndex);
      resultsRef.current
        ?.querySelectorAll("li button")
        [newIndex]?.scrollIntoView({ block: "nearest" });
    } else if (e.key === "Enter" && selectedResultIndex >= 0) {
      e.preventDefault();
      navigateToResult(searchResults[selectedResultIndex]);
    } else if (e.key === "Escape") {
      setShowResults(false);
    }
  };
  const getTypeIcon = (type) => {
    const iconProps = { size: 18, className: "flex-shrink-0" };
    switch (type) {
      case "lead":
        return <User {...iconProps} className={`${iconProps.className} text-blue-500`} />;
      case "property":
        return <Home {...iconProps} className={`${iconProps.className} text-green-500`} />;
      case "task":
        return <Calendar {...iconProps} className={`${iconProps.className} text-orange-500`} />;
      case "user":
        return <Users {...iconProps} className={`${iconProps.className} text-purple-500`} />;
      case "dashboard":
        return <LayoutDashboard {...iconProps} className={`${iconProps.className} text-indigo-500`} />;
      case "analytics":
        return <BarChart3 {...iconProps} className={`${iconProps.className} text-pink-500`} />;
      default:
        return <FileText {...iconProps} className={`${iconProps.className} text-gray-500`} />;
    }
  };

  // --- FIX: Helper function to correctly format category names ---
  const getCategoryDisplayName = (key) => {
    const name = key.charAt(0).toUpperCase() + key.slice(1);
    if (key === 'property') return 'Properties'; // Fix for "Propertys"
    if (key === 'analytics') return 'Analytics'; // Fix for "Analyticss"
    if (key === 'dashboard') return 'Dashboards';
    return `${name}s`; // Default pluralization for 'Lead', 'Task', 'User'
  };

  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      try {
        setRecentSearches(JSON.parse(savedSearches));
      } catch (e) {
        localStorage.removeItem("recentSearches");
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (remindersRef.current && !remindersRef.current.contains(event.target)) {
        setShowRemindersPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <nav
        // --- FIX: Added `relative` and `z-30` to establish a stacking context ---
        // This ensures the entire navbar, including its dropdowns, appears above the main page content.
        // I also standardized the padding classes to px-6 and py-4.
        className={`relative z-30 w-full px-5 py-5.5 border-b ${
          isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
        }`}
      >
        <div className="relative flex items-center justify-end gap-4">
          <div
            ref={searchRef}
            className="absolute left-1/2 transform -translate-x-1/2 w-full max-w-md hidden md:block"
          >
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search
                    size={16}
                    className={isDark ? "text-gray-400" : "text-gray-500"}
                  />
                </div>
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() =>
                    searchQuery &&
                    searchResults.length > 0 &&
                    setShowResults(true)
                  }
                  placeholder="Search Leads, Properties, Tasks..."
                  className={`w-full pl-10 pr-10 py-2 rounded-md border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isDark
                      ? "bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400"
                      : "bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500"
                  } ${
                    showResults
                      ? "rounded-b-none border-b-transparent"
                      : ""
                  }`}
                />
                {searchQuery && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {isFiltering ? (
                      <Loader2
                        size={16}
                        className="animate-spin text-gray-400"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="text-gray-400 hover:text-gray-500"
                        aria-label="Clear search"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {showResults && (
                <div
                  className={`absolute z-[100] w-full mt-0 overflow-hidden rounded-b-md shadow-lg border ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-300"
                  }`}
                >
                  <div className={`px-3 py-2 flex flex-wrap gap-2 border-b ${isDark ? "border-gray-700" : "border-gray-200"}`}>
                    {Object.keys(searchCategories).map((categoryKey) => (
                      <button
                        key={categoryKey}
                        type="button"
                        onClick={() => toggleCategory(categoryKey)}
                        className={`px-2.5 py-1 text-xs rounded-full flex items-center gap-1.5 transition-colors ${
                          searchCategories[categoryKey]
                            ? isDark
                              ? `bg-${getTypeIcon(categoryKey).props.className.split("-")[1]}-900/30 text-${getTypeIcon(categoryKey).props.className.split("-")[1]}-300`
                              : `bg-${getTypeIcon(categoryKey).props.className.split("-")[1]}-100 text-${getTypeIcon(categoryKey).props.className.split("-")[1]}-800`
                            : isDark
                            ? "bg-gray-700 text-gray-400 hover:bg-gray-600"
                            : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                        }`}
                      >
                        {getTypeIcon(categoryKey)}
                        {/* --- FIX: Using the helper function for correct text --- */}
                        {getCategoryDisplayName(categoryKey)}
                      </button>
                    ))}
                  </div>
                  {isFetchingInitialData ? (
                    <div className={`p-4 text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      <Loader2 size={20} className="animate-spin mx-auto mb-2" />
                      Loading data...
                    </div>
                  ) : searchResults.length > 0 ? (
                    <ul ref={resultsRef} className="max-h-96 overflow-y-auto">
                      {searchResults.map((result, index) => (
                        <li key={`${result.type}-${result.id}-${index}`}>
                          <button
                            type="button"
                            onClick={() => navigateToResult(result)}
                            onMouseEnter={() => setSelectedResultIndex(index)}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors duration-150 ${
                              selectedResultIndex === index
                                ? isDark
                                  ? "bg-blue-900/60"
                                  : "bg-blue-100"
                                : isDark
                                ? "hover:bg-gray-700"
                                : "hover:bg-gray-50"
                            } ${
                              index < searchResults.length - 1
                                ? isDark
                                  ? "border-b border-gray-700"
                                  : "border-b border-gray-200"
                                : ""
                            }`}
                          >
                            {getTypeIcon(result.type)}
                            <div className="min-w-0 flex-1">
                              <div className={`font-medium truncate ${isDark ? "text-gray-200" : "text-gray-800"}`}>
                                {result.title}
                              </div>
                              <div className={`text-xs truncate ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                                {result.description}
                              </div>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : searchQuery.trim() ? (
                    <div className={`p-4 text-center ${isDark ? "text-gray-300" : "text-gray-600"}`}>
                      No results found for "{searchQuery}".
                      <button
                        type="button"
                        className={`block mx-auto mt-2 text-sm ${isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-700"}`}
                        onClick={() => {
                          const allCatsTrue = Object.keys(searchCategories).reduce((acc, key) => ({ ...acc, [key]: true }), {});
                          setSearchCategories(allCatsTrue);
                          const lowerCaseQuery = searchQuery.toLowerCase();
                          setIsFiltering(true);
                          const filtered = allSearchableData.filter(
                            (item) =>
                              (item.title && item.title.toLowerCase().includes(lowerCaseQuery)) ||
                              (item.description && item.description.toLowerCase().includes(lowerCaseQuery))
                          );
                          setSearchResults(filtered);
                          setIsFiltering(false);
                        }}
                      >
                        Try searching all categories
                      </button>
                    </div>
                  ) : recentSearches.length > 0 && !isFetchingInitialData ? (
                    <div>
                      <div className={`px-4 py-2 text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                        Recent Searches
                      </div>
                      <ul>
                        {recentSearches.map((search, index) => (
                          <li key={index}>
                            <button
                              type="button"
                              onClick={() => {
                                setSearchQuery(search);
                                handleSearchChange({ target: { value: search } });
                              }}
                              className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors duration-150 ${isDark ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"}`}
                            >
                              <Search size={14} className="opacity-70" />
                              {search}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className={`p-4 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                      Start typing to search...
                    </div>
                  )}
                  <div className={`px-4 py-2 text-xs border-t ${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}>
                    <p className="flex items-center gap-1">
                      <kbd className={`px-1.5 py-0.5 text-xs rounded ${isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"}`}>↑</kbd>
                      <kbd className={`px-1.5 py-0.5 text-xs rounded ${isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"}`}>↓</kbd>
                      to navigate,
                      <kbd className={`px-1.5 py-0.5 text-xs rounded ${isDark ? "bg-gray-600 text-gray-300" : "bg-gray-200 text-gray-700"}`}>Enter</kbd>
                      to select
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>

          <ul className="hidden md:flex items-center gap-6 text-sm">
            <li className={`font-bold hover:text-blue-500 cursor-pointer ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              Team
            </li>
            <li className="relative" ref={remindersRef}>
              <button
                onClick={toggleRemindersPopup}
                className={`p-1 rounded-full ${isDark ? "hover:bg-gray-700" : "hover:bg-gray-200"}`}
              >
                <Bell size={20} className={isDark ? "text-gray-300" : "text-gray-700"} />
              </button>
              {showRemindersPopup && (
                <div className="absolute top-full mt-2 right-0 z-[100] max-h-[85vh]">
                  <Reminders isDark={isDark} />
                </div>
              )}
            </li>
          </ul>
          <button
            className="md:hidden text-gray-500 hover:text-blue-500"
            aria-label="Search"
            onClick={() => {
              console.warn("Mobile search UI toggle to be implemented.");
            }}
          >
            <Search size={20} />
          </button>
        </div>
      </nav>

      <SearchResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={selectedResult}
      />
    </>
  );
};

export default Navbar;