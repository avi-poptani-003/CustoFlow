// API service that integrates with existing authService
import authService from "./authService"

const api = authService.getApiInstance()

class ApiService {
  constructor() {
    this.api = api
  }

  async request(endpoint, options = {}) {
    try {
      const config = {
        ...options,
      }

      let response
      const method = options.method?.toLowerCase() || "get"

      switch (method) {
        case "get":
          response = await this.api.get(endpoint, { params: options.params })
          break
        case "post":
          response = await this.api.post(endpoint, options.body)
          break
        case "put":
          response = await this.api.put(endpoint, options.body)
          break
        case "patch":
          response = await this.api.patch(endpoint, options.body)
          break
        case "delete":
          response = await this.api.delete(endpoint)
          break
        default:
          throw new Error(`Unsupported method: ${method}`)
      }

      return response.data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Lead-related API calls using the existing endpoint structure
  async getLeadDashboardStats() {
    return this.request("/leads/dashboard_stats/")
  }

  async getLeads(params = {}) {
    return this.request("/leads/", { params })
  }

  async createLead(leadData) {
    return this.request("/leads/", {
      method: "POST",
      body: leadData,
    })
  }

  async updateLead(leadId, leadData) {
    return this.request(`/leads/${leadId}/`, {
      method: "PATCH",
      body: leadData,
    })
  }

  async deleteLead(leadId) {
    return this.request(`/leads/${leadId}/`, {
      method: "DELETE",
    })
  }

  // Additional methods that use your existing leadService patterns
  async importLeads(formData) {
    return this.request("/leads/import_leads/", {
      method: "POST",
      body: formData,
    })
  }

  async exportLeads(filters = {}) {
    return this.request("/leads/export/", { params: filters })
  }
}

export default new ApiService()
