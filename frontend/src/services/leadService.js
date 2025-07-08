// src/services/LeadService.js
import authService from "./authService";
const api = authService.getApiInstance();

const LeadService = {
  // ... getLeads, getLead, etc.
    getLeads: async (params = {}) => {
    try {
      console.log("getLeads params:", params)

      // Ensure proper parameter formatting
      const queryParams = {
        ...params,
        page_size: params.page_size || params.pageSize || 10,
        page: params.page || 1,
      }

      // Remove any undefined or null values
      Object.keys(queryParams).forEach((key) => {
        if (
          queryParams[key] === undefined ||
          queryParams[key] === null ||
          queryParams[key] === "All Sources" ||
          queryParams[key] === "All Statuses" ||
          queryParams[key] === "All Assignees"
        ) {
          delete queryParams[key]
        }
      })

      console.log("getLeads queryParams:", queryParams)
      const response = await api.get("/leads/", { params: queryParams })
      console.log("getLeads response:", response.data)

      // If we have actual results, return them
      if (response.data?.results) {
        return {
          results: response.data.results,
          count: Number.parseInt(response.data.count || 0),
          next: response.data.next,
          previous: response.data.previous,
        }
      }

      // If we get a direct array (non-paginated response), wrap it
      if (Array.isArray(response.data)) {
        return {
          results: response.data,
          count: response.data.length,
          next: null,
          previous: null,
        }
      }

      // Fallback to empty state
      return {
        results: [],
        count: 0,
        next: null,
        previous: null,
      }
    } catch (error) {
      console.error("Error fetching leads:", error)
      if (error.response?.status === 401) {
        // Let the auth interceptor handle token refresh
        throw error
      }
      if (error.response?.status === 403) {
        throw new Error("You do not have permission to view leads")
      }
      throw new Error("Failed to fetch leads. Please try again.")
    }
  },

  // Get a single lead by ID
  getLead: async (id) => {
    try {
      const response = await api.get(`/leads/${id}/`)
      return response.data
    } catch (error) {
      console.error(`Error fetching lead ${id}:`, error)
      throw error
    }
  },

  // Create a new lead
  createLead: async (leadData) => {
    try {
      // Format the data according to backend expectations
      const formattedData = {
        name: leadData.name,
        email: leadData.email,
        phone: leadData.phone,
        company: leadData.company || "",
        position: leadData.position || "",
        status: leadData.status,
        source: leadData.source,
        interest: leadData.interest || "",
        priority: leadData.priority,
        assigned_to: leadData.assignedToId,
        budget: leadData.budget || "",
        timeline: leadData.timeline || "",
        requirements: leadData.requirements || "",
        notes: leadData.notes || "",
        tags: Array.isArray(leadData.tags) ? leadData.tags : [],
        last_activity: "Lead created",
      }

      const response = await api.post("/leads/", formattedData)
      return response.data
    } catch (error) {
      console.error("Error creating lead:", error)
      throw error
    }
  },

  // Update an existing lead
  updateLead: async (id, leadData) => {
    try {
      const response = await api.patch(`/leads/${id}/`, leadData)
      return response.data
    } catch (error) {
      console.error(`Error updating lead ${id}:`, error)
      throw error
    }
  },

  // Delete a lead
  deleteLead: async (id) => {
    try {
      await api.delete(`/leads/${id}/`)
      return { success: true }
    } catch (error) {
      console.error(`Error deleting lead ${id}:`, error)
      throw error
    }
  },

  // Import leads from CSV/Excel
  importLeads: async (formData) => {
    try {
      // Use Django action endpoint
      const response = await api.post("/leads/import_leads/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error importing leads:", error)
      throw error
    }
  },

  // Export leads to CSV
  exportLeads: async (filters = {}) => {
    try {
      const response = await api.get("/leads/export/", {
        params: filters,
        responseType: "blob",
      })
      return response.data
    } catch (error) {
      console.error("Error exporting leads:", error)
      throw error
    }
  },

  // Update lead status
  updateLeadStatus: async (id, status) => {
    try {
      const response = await api.post(`/leads/${id}/update_status/`, { status })
      return response.data
    } catch (error) {
      console.error(`Error updating lead ${id} status:`, error)
      throw error
    }
  },

  // Assign lead to user
  assignLead: async (id, userId) => {
    try {
      const response = await api.post(`/leads/${id}/assign/`, { user_id: userId })
      return response.data
    } catch (error) {
      console.error(`Error assigning lead ${id}:`, error)
      throw error
    }
  },

  // Get lead statistics - NEW METHOD for dashboard
  getLeadStatistics: async () => {
    try {
      const response = await api.get("/leads/statistics/")
      return response.data
    } catch (error) {
      console.error("Error fetching lead statistics:", error)
      throw error
    }
  },
  getRevenueOverview: async (params = {}) => {
    try {
      const response = await api.get("/leads/revenue_overview/", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching revenue overview:", error);
      throw error;
    }
  },

  getTeamPerformance: async () => {
    try {
      const response = await api.get("/leads/team_performance/");
      return response.data;
    } catch (error) {
      console.error("Error fetching team performance data:", error);
      throw error;
    }
  },

  getDashboardStats: async (timeRange = 'week') => {
    try {
      const response = await api.get("/leads/dashboard_stats/", {
        params: { time_range: timeRange }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  getBuilderPerformance: async () => {
    try {
      const response = await api.get("/leads/builder_performance/");
      return response.data;
    } catch (error) {
      console.error("Error fetching builder performance data:", error);
      throw error;
    }
  },


  getApiInstance: () => api,
};

export default LeadService;