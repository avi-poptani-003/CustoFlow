import { useState } from "react";

const rolePermissions = {
  admin: [
    "create_leads",
    "edit_leads",
    "delete_leads",
    "view_all_leads",
    "import_leads",
    "export_leads",
    "assign_leads",
    "create_users", // Only admin can create users
  ],
  manager: [
    "create_leads",
    "edit_leads",
    "view_all_leads",
    "import_leads",
    "export_leads",
    "assign_leads",
  ],
  agent: ["create_leads", "edit_leads", "view_all_leads"],
  viewer: ["view_all_leads"],
};

export function useUserRole() {
  // In a real app, this would come from your auth context or API
  const [userRole, setUserRole] = useState("admin");

  const hasPermission = (permission) => {
    return rolePermissions[userRole].includes(permission);
  };

  // For demo purposes, allow changing the role
  const changeRole = (role) => {
    setUserRole(role);
  };

  return {
    userRole,
    hasPermission,
    changeRole,
  };
}
