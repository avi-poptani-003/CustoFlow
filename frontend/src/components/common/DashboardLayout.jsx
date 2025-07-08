import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
  const { theme } = useTheme();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 1024);
  const isDark = theme === "dark";
  
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
      <Sidebar />
      <main className={`flex-1 ${isDark ? "bg-gray-900" : "bg-gray-100"}`}>
        <div className={`transition-all duration-300 min-h-screen
          ${isMobileView ? "pl-0" : "pl-[70px] lg:group-hover:pl-64"}`}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
