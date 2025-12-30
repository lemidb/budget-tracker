// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  // This ensures cookies (including the accessToken) are sent with requests
  withCredentials: true,
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      // Only redirect if we're not already on a public route
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const isPublicRoute = currentPath.startsWith('/auth/login') || 
                             currentPath.startsWith('/auth/signup') || 
                             currentPath === '/';
        
        if (!isPublicRoute) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;