import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Send cookies with requests
});

// Add a request interceptor to handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 and we haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // If refresh is in progress, queue the request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(() => {
                    return api(originalRequest);
                })
                .catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh token
                const response = await api.post('/auth/token/refresh/');
                isRefreshing = false;
                processQueue(null);
                
                return api(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError);
                
                // If refresh failed, redirect to login only if not already on login page
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

const authService = {
    // Register new user (manager or agent)
    register: async (userData) => {
        const response = await api.post('/auth/register/', userData);
        return response.data;
    },

    // Login user (tokens are set as cookies by backend)
    login: async (credentials) => {
        const response = await api.post('/auth/login/', credentials);
        return response.data;
    },

    // Logout user (clears cookies on backend)
    logout: async () => {
        try {
            await api.post('/auth/logout/');
        } catch (error) {
            console.error('Logout error:', error);
        }
        // Force reload the page to clear any application state
        window.location.href = '/login';
    },

    // Get user profile
    getUserProfile: async () => {
        const response = await api.get('/auth/user/');
        return response.data;
    },

    // Update user profile
    updateUserProfile: async (userData) => {
        const response = await api.patch('/auth/user/', userData);
        return response.data;
    },

    // Update profile image
    updateProfileImage: async (imageFile) => {
        const formData = new FormData();
        formData.append('profile_image', imageFile);
        
        const response = await api.patch('/auth/user/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Change password
    changePassword: async (passwordData) => {
        const response = await api.post('/auth/password-change/', passwordData);
        return response.data;
    },

    // Request password reset
    requestPasswordReset: async (email) => {
        const response = await api.post('/auth/password-reset/', { email });
        return response.data;
    },

    // Confirm password reset
    confirmPasswordReset: async (resetData) => {
        const response = await api.post('/auth/password-reset/confirm/', resetData);
        return response.data;
    },

    // Get API instance for other services to use
    getApiInstance: () => api,
};



export default authService;

