import axios from 'axios';
import { getSession } from '@/utils/auth';
import { handleApiError } from './errorHandler';
//import { getSession } from '../../auth/index';

const secretKey = process.env.MYSECRETKEY || "Bearer";


// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL
});

// Add a request interceptor to attach CSRF token
axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = await getSession(); // Get the access token
  if (accessToken) {
    config.headers.Authorization = `${secretKey} ${accessToken}`;
  }
  return config;
});

// Add a response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    const method = error.config?.method?.toUpperCase(); // Determine the HTTP method
    const endpoint = error.config?.url || 'Unknown endpoint';
    const errorDetails = `Código de error: ${error.code}\nRespuesta del servidor: ${JSON.stringify(error?.response?.data)}`;
    // Only handle toasts for non-GET methods
    if (method && method !== 'GET') {
      handleApiError(error, endpoint); // Show toast and log error
    }
    return Promise.reject(error); // Propagate the error
  }
);

export default axiosInstance;
