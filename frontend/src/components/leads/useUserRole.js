import { useAuth } from "../../context/AuthContext";

export function useUserRole() {
    const { user } = useAuth(); // Now properly using user from context

    // Define role-based permissions
    // It's good practice to keep this configuration manageable,
    // possibly even in a separate constants file if it grows large.
    const rolePermissions = {
        admin: [
            "create_leads",
            "edit_leads",
            "delete_leads",
            "view_all_leads",
            "import_leads",
            "export_leads",
            "assign_leads",
            "create_users",
        ],
        manager: [
            "create_leads",
            "edit_leads",
            "delete_leads",
            "view_all_leads",
            "import_leads",
            "export_leads",
            "assign_leads",
        ],
        agent: ["create_leads", "edit_leads", "view_all_leads"], // Assuming agents can view all leads based on original code
        viewer: ["view_all_leads"],
    };

    // Determine the user's role; default to 'viewer' or a suitable guest role if no user/role.
    const userRole = user?.role || "viewer";

    /**
     * Checks if the current user has a specific permission.
     * @param {string} permission - The permission string to check (e.g., "create_leads").
     * @returns {boolean} True if the user has the permission, false otherwise.
     */
    const hasPermission = (permission) => {
        return rolePermissions[userRole]?.includes(permission) || false;
    };

    return {
        userRole,
        hasPermission,
    };
}