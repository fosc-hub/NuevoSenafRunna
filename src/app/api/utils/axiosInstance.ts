import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession } from '@/utils/auth';
import { handleApiError } from './errorHandler';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://web-runna-v2legajos.up.railway.app/api',
});

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Process the queue of failed requests after token refresh
 */
const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Refresh the access token using the refresh token
 * POST /api/token/refresh/
 * @returns The new access token or null if refresh fails
 */
export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = Cookies.get('refreshToken');
    
    if (!refreshToken) {
      console.warn('No refresh token available');
      return null;
    }

    // Make request directly with axios to avoid interceptor loops
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://web-runna-v2legajos.up.railway.app/api'}/token/refresh/`,
      { refresh: refreshToken }
    );

    const newAccessToken = response.data.access;
    
    if (newAccessToken) {
      // Update the access token in cookies
      Cookies.set('accessToken', newAccessToken, {
        secure: true,
        sameSite: 'lax',
      });
      
      return newAccessToken;
    }
    
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear tokens on refresh failure (refresh token is likely expired)
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    return null;
  }
};

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

// Add a response interceptor to handle 401 errors and token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Log errors for debugging but don't call client-side functions from here
    // as this interceptor can be called from server-side code
    if (typeof window !== 'undefined') {
      const method = error.config?.method?.toUpperCase();
      const endpoint = error.config?.url || 'Unknown endpoint';
      console.error(`API Error - ${endpoint}:`, {
        method,
        status: error.response?.status,
        data: error.response?.data
      });
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Skip refresh for token endpoints to avoid infinite loops
      if (originalRequest.url?.includes('/token/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          // Update the authorization header and retry the original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          processQueue(null, newToken);
          return axiosInstance(originalRequest);
        } else {
          // Refresh failed - redirect to login if in browser
          processQueue(new Error('Token refresh failed'), null);
          if (typeof window !== 'undefined') {
            // Clear any remaining tokens
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            // Redirect to login page
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        if (typeof window !== 'undefined') {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
