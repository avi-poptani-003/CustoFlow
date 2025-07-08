// src/components/common/RoleBasedWrapper.jsx
import React from 'react';
import { useAuth } from '../../context/AuthContext';

/**
 * A component that conditionally renders its children based on user roles
 * @param {Object} props
 * @param {Array} props.allowedRoles - Array of roles that are allowed to see the children
 * @param {React.ReactNode} props.children - The content to render if user has permission
 * @param {React.ReactNode} props.fallback - Optional content to render if user doesn't have permission
 */
const RoleBasedWrapper = ({ allowedRoles, children, fallback = null }) => {
  const { user } = useAuth();
  
  // If no user is logged in, don't render anything
  if (!user) return fallback;
  
  // Check if the user's role is in the allowed roles
  const hasPermission = allowedRoles.includes(user.role);
  
  // Render children if user has permission, otherwise render fallback
  return hasPermission ? children : fallback;
};

export default RoleBasedWrapper;