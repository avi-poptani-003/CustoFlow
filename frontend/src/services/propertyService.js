// src/services/propertyService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(config => {
  if (config.method === 'get') {
    config.params = {
      ...config.params,
      _t: new Date().getTime()
    };
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

const propertyService = {
  getProperties: async () => {
    try {
      const response = await api.get('/properties/');
      return response.data;
    } catch (error) {
      console.error("Error fetching properties:", error);
      throw error;
    }
  },

  getProperty: async (id) => {
    try {
      const response = await api.get(`/properties/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching property ${id}:`, error);
      throw error;
    }
  },

  createProperty: async (propertyData) => {
    try {
      const formData = new FormData();
      
      // Append all property data fields
      Object.entries(propertyData).forEach(([key, value]) => {
        if (key !== 'images' && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      // Append images
      if (propertyData.images && propertyData.images.length > 0) {
        propertyData.images.forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await api.post('/properties/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      return response.data;
    } catch (error) {
      console.error("Error creating property:", error);
      throw error;
    }
  },

  updateProperty: async (id, propertyData) => {
    try {
      const formData = new FormData();
      
      Object.entries(propertyData).forEach(([key, value]) => {
        if (key !== 'images' && value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      if (propertyData.images && propertyData.images.length > 0) {
        propertyData.images.forEach((file) => {
          formData.append('images', file);
        });
      }

      const response = await api.put(`/properties/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating property ${id}:`, error);
      throw error;
    }
  },

  deleteProperty: async (id) => {
    try {
      await api.delete(`/properties/${id}/`);
      return true;
    } catch (error) {
      console.error(`Error deleting property ${id}:`, error);
      throw error;
    }
  },

  // Helper function to get full image URL
  getImageUrl: (imagePath) => {
    if (!imagePath) return '/placeholder.svg';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE_URL}${imagePath}`;
  }
};

export default propertyService;