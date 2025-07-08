import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // If a specific theme ('light', 'dark', or 'auto') is saved, use it.
    // Otherwise, default to 'auto' to follow system preference initially.
    return savedTheme || 'auto';
  });

  const [appliedTheme, setAppliedTheme] = useState('light'); // Will be 'light' or 'dark'

  const updateAppliedTheme = useCallback(() => {
    let currentTheme;
    if (theme === 'auto') {
      currentTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else {
      currentTheme = theme;
    }
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(currentTheme);
    setAppliedTheme(currentTheme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    updateAppliedTheme();
  }, [theme, updateAppliedTheme]);

  // Listen for system theme changes to update appliedTheme when in 'auto' mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'auto') { // Only update if current selection is 'auto'
        updateAppliedTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    // Initial check in case theme is already 'auto' from localStorage
    if (theme === 'auto') {
        updateAppliedTheme();
    }
    
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, updateAppliedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, appliedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
