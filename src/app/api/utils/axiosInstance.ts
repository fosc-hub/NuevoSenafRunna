import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getSession } from '@/utils/auth';
import { handleApiError } from './errorHandler';
import Cookies from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://web-runna-v2legajos.up.railway.app/api',
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

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

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = Cookies.get('refreshToken');
    if (!refreshToken) {
      console.warn('No refresh token available');
      return null;
    }

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://web-runna-v2legajos.up.railway.app/api'}/token/refresh/`,
      { refresh: refreshToken }
    );

    const newAccessToken = response.data.access;
    if (newAccessToken) {
      Cookies.set('accessToken', newAccessToken, { secure: true, sameSite: 'lax' });
      return newAccessToken;
    }
    return null;
  } catch (error) {
    console.error('Token refresh failed:', error);
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    return null;
  }
};

axiosInstance.interceptors.request.use(
  async (config) => {
    if (!config.headers.Authorization) {
      const session = await getSession();
      const accessToken = typeof session === 'string' ? session : Cookies.get('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (typeof window !== 'undefined') {
      const method = error.config?.method?.toUpperCase();
      const endpoint = error.config?.url || 'Unknown endpoint';
      console.error(`API Error - ${endpoint}:`, {
        method,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/token/')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
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
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          processQueue(null, newToken);
          return axiosInstance(originalRequest);
        } else {
          processQueue(new Error('Token refresh failed'), null);
          if (typeof window !== 'undefined') {
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
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
