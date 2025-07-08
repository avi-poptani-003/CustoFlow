// src/services/siteVisitService.js
import apiServiceInstance from './api'; // This is your ApiService instance

// Define endpoint paths *relative* to the baseURL configured in authService.js (which is http://localhost:8000/api)
const SITE_VISITS_ENDPOINT = "/site-visits/"; // Note: No leading "/api" here
const PROPERTIES_ENDPOINT = "/properties/";   // Note: No leading "/api" here
const USERS_ENDPOINT = "/users/";             // Note: No leading "/api" here

const siteVisitService = {
  /**
   * Fetches all site visits from the backend.
   */
  getAllSiteVisits: async () => {
    try {
      return await apiServiceInstance.request(SITE_VISITS_ENDPOINT);
    } catch (error) {
      // The error object from ApiService.request should already be an AxiosError
      console.error("Error fetching all site visits:", error.message, error.config?.url, error.response?.data);
      throw error;
    }
  },

  getUpcomingSiteVisits: async () => {
    try {
      // CORRECTED: Changed from ".get()" to the existing ".request()" method
      return await apiServiceInstance.request(`${SITE_VISITS_ENDPOINT}upcoming/`);
    } catch (error) {
      console.error("Error fetching upcoming site visits:", error.message);
      throw error;
    }
  },

  /**
   * NEW FUNCTION: Fetches the summary counts for the reminders widget.
   */
  getSummaryCounts: async () => {
    try {
      // This endpoint name must match the @action in your views.py
      return await apiServiceInstance.request(`${SITE_VISITS_ENDPOINT}summary_counts/`);
    } catch (error)
    {
      console.error("Error fetching summary counts:", error.message);
      throw error;
    }
  },

  /**
   * Fetches a single site visit by its ID.
   * @param {number|string} id - The ID of the site visit.
   */
  getSiteVisitById: async (id) => {
    try {
      return await apiServiceInstance.request(`${SITE_VISITS_ENDPOINT}${id}/`);
    } catch (error) {
      console.error(`Error fetching site visit with ID ${id}:`, error.message, error.config?.url, error.response?.data);
      throw error;
    }
  },

  /**
   * Creates a new site visit.
   * @param {object} visitData - The data for the new site visit.
   */
  createSiteVisit: async (visitData) => {
    try {
      return await apiServiceInstance.request(SITE_VISITS_ENDPOINT, {
        method: "POST",
        body: visitData,
      });
    } catch (error) {
      console.error("Error creating site visit:", error.message, error.config?.url, error.response?.data);
      throw error;
    }
  },

  /**
   * Updates an existing site visit.
   * @param {number|string} id - The ID of the site visit to update.
   * @param {object} visitData - The data to update.
   */
  updateSiteVisit: async (id, visitData) => {
    try {
      return await apiServiceInstance.request(`${SITE_VISITS_ENDPOINT}${id}/`, {
        method: "PATCH",
        body: visitData,
      });
    } catch (error) {
      console.error(`Error updating site visit with ID ${id}:`, error.message, error.config?.url, error.response?.data);
      throw error;
    }
  },

  /**
   * Deletes a site visit by its ID.
   * @param {number|string} id - The ID of the site visit to delete.
   */
  deleteSiteVisit: async (id) => {
    try {
      return await apiServiceInstance.request(`${SITE_VISITS_ENDPOINT}${id}/`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error(`Error deleting site visit with ID ${id}:`, error.message, error.config?.url, error.response?.data);
      throw error;
    }
  },

  /**
   * Fetches properties for dropdowns/listings.
   */
  getProperties: async () => {
    try {
      return await apiServiceInstance.request(PROPERTIES_ENDPOINT);
    } catch (error) {
      console.error("Error fetching properties:", error.message, error.config?.url, error.response?.data);
      throw error;
    }
  },

  /**
   * Fetches users (clients and agents) for dropdowns/listings.
   */
  getUsers: async () => {
    try {
      return await apiServiceInstance.request(USERS_ENDPOINT);
    } catch (error) {
      console.error("Error fetching users:", error.message, error.config?.url, error.response?.data);
      throw error;
    }
  },
};

export default siteVisitService;