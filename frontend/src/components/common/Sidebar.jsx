import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  UserCog,
  BarChart3,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Sidebar = () => {
  const location = useLocation();
  const auth = useAuth();
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
  const [isHovered, setIsHovered] = useState(false);
  const userRole = auth.user?.role || "agent";
  const isDark = theme === "dark";

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "manager", "agent"],
    },
    {
      path: "/dashboard/leads",
      label: "Leads",
      icon: Users,
      roles: ["admin", "manager", "agent"],
    },
    {
      path: "/dashboard/properties",
      label: "Properties",
      icon: Building2,
      roles: ["admin", "manager", "agent"],
    },
    {
      path: "/dashboard/site-visits",
      label: "Site Visits",
      icon: CalendarCheck,
      roles: ["admin", "manager", "agent"],
    },
    {
      path: "/dashboard/team",
      label: "Team Management",
      icon: UserCog,
      roles: ["admin"],
    },
    {
      path: "/dashboard/analytics",
      label: "Analytics",
      icon: BarChart3,
      roles: ["admin", "manager"],
    },
    {
      path: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      roles: ["admin", "manager", "agent"],
    },
  ];

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobileView(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => auth.logout();

  return (
    <>
      {/* Mobile Menu Button - Only shown on mobile */}
      <motion.button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg transition-colors duration-300 ${
          isDark ? "text-white bg-gray-800" : "text-gray-800 bg-white"
        } shadow-lg`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Menu className="w-5 h-5" />
      </motion.button>

      {/* Sidebar */}
      <motion.aside
        initial={{ width: isMobileView ? 0 : "4.375rem" }}
        animate={{
          width: isMobileView
            ? isMobileMenuOpen
              ? "16rem"
              : 0
            : isHovered
            ? "16rem"
            : "4.375rem",
          x: isMobileView ? (isMobileMenuOpen ? 0 : "-100%") : 0,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`fixed top-0 left-0 h-screen z-40 ${
          isDark ? "bg-gray-900 text-gray-100" : "bg-white text-gray-800"
        } shadow-lg flex flex-col justify-between overflow-hidden`}
        onHoverStart={() => !isMobileView && setIsHovered(true)}
        onHoverEnd={() => !isMobileView && setIsHovered(false)}
      >
        {/* Logo */}
        <div>
          <div
            className={`h-[72.5px] flex items-center border-b ${
              isDark ? "border-gray-800" : "border-gray-300"
            }`}
          >
            <div className="min-w-[70px] flex items-center justify-center">
              <img src="/vite.svg" alt="Logo" className="h-7 w-7" />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isMobileView || isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h1 className="text-lg font-semibold">RealEstate CRM</h1>
            </motion.div>
          </div>

          {/* Profile */}
          <div
            className={`h-[70px] flex items-center border-b ${
              isDark ? "border-gray-800" : "border-gray-300"
            }`}
          >
            <div className="min-w-[70px] flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isDark
                    ? "bg-gray-700 text-gray-200"
                    : "bg-gray-300 text-gray-700"
                }`}
              >
                {auth.user?.username?.[0]?.toUpperCase() || "U"}
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isMobileView || isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <h2 className="text-sm font-medium truncate">
                {auth.user?.username || "User"}
              </h2>
              <p className="text-xs capitalize text-gray-500">{userRole}</p>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className="py-4">
            {filteredNavItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to={item.path}
                  className={`h-[50px] flex items-center transition-all duration-200 ease-in-out ${
                    location.pathname === item.path
                      ? "bg-blue-600 text-white"
                      : isDark
                      ? "text-gray-300 hover:bg-gray-800 hover:text-white"
                      : "text-gray-700 hover:bg-gray-300 hover:text-gray-900"
                  }`}
                >
                  <div className="min-w-[70px] flex items-center justify-center">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isMobileView || isHovered ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                </Link>
              </motion.div>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div
          className={`border-t ${
            isDark ? "border-gray-800" : "border-gray-300"
          }`}
        >
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`h-[50px] w-full flex items-center transition-all duration-200 ease-in-out ${
              isDark
                ? "text-gray-300 hover:bg-red-900/20 hover:text-red-400"
                : "text-gray-700 hover:bg-red-100 hover:text-red-600"
            }`}
          >
            <div className="min-w-[70px] flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: isMobileView || isHovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              Logout
            </motion.span>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileView && isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-opacity-50 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
