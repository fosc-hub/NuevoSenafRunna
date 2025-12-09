import axios from 'axios';
import { getSession } from '@/utils/auth';
import { handleApiError } from './errorHandler';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://web-runna-v2legajos.up.railway.app/api',
});

// Add a request interceptor to add the token to all requests
axiosInstance.interceptors.request.use(
  async (config) => {
    // Only add token if Authorization header is not already set
    if (!config.headers.Authorization) {
      const session = await getSession();
      // Handle both cases: when getSession returns a token string or user data
      const accessToken = typeof session === 'string' ? session : Cookies.get('accessToken');

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for debugging but don't call client-side functions from here
    // as this interceptor can be called from server-side code
    if (typeof window !== 'undefined') {
      // Only log in browser environment
      const method = error.config?.method?.toUpperCase();
      const endpoint = error.config?.url || 'Unknown endpoint';
      console.error(`API Error - ${endpoint}:`, {
        method,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
