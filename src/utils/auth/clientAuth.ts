import axiosInstance from '@/app/api/utils/axiosInstance';
import jwt from 'jsonwebtoken';
import Cookies from 'js-cookie';
import { JwtPayload } from 'jsonwebtoken';
import { UserPermissions } from './userZustand';

export async function decodeToken(accessToken?: string) {
    try {
        const token = accessToken || Cookies.get('accessToken');
        if (!token) return null;

        const decoded = jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET || 'default-secret');
        return decoded;
    } catch (e) {
        return null;
    }
}

export async function login(username: string, password: string) {
    const response = await axiosInstance.post('/token/', { username, password });

    const tokens = {
        refresh: response.data.refresh,
        access: response.data.access,
    };

    Cookies.set('refreshToken', tokens.refresh, {
        secure: true,
        sameSite: 'lax',
    });

    Cookies.set('accessToken', tokens.access, {
        secure: true,
        sameSite: 'lax',
    });

    return tokens.access;
}

export const getSession = async (returnUserData: boolean = false): Promise<string | UserPermissions | null> => {
    try {
        const accessToken = Cookies.get('accessToken');
        if (!accessToken) {
            return null;
        }

        // If we just need the token, return it immediately
        if (!returnUserData) {
            return accessToken;
        }

        // Verify token and get user data
        const decoded = jwt.verify(accessToken, process.env.NEXT_PUBLIC_JWT_SECRET || 'default-secret') as JwtPayload;
        const currentTime = Math.floor(Date.now() / 1000);

        // If token is expired, try to refresh it
        if (decoded.exp && decoded.exp < currentTime) {
            const refreshToken = Cookies.get('refreshToken');
            if (!refreshToken) {
                return null;
            }

            try {
                const response = await axiosInstance.post('/token/refresh/', {
                    refresh: refreshToken
                });

                const newAccessToken = response.data.access;
                Cookies.set('accessToken', newAccessToken, {
                    secure: true,
                    sameSite: 'lax',
                });
                return newAccessToken;
            } catch (error) {
                console.error('Error refreshing token:', error);
                return null;
            }
        }

        // Get user data
        try {
            const response = await axiosInstance.get<UserPermissions>('/user/me/');
            return response.data;
        } catch (error) {
            console.error('Error fetching user data:', error);
            return accessToken; // Return the token if we can't get user data
        }
    } catch (error) {
        console.error('Error in getSession:', error);
        return null;
    }
};

export async function logout() {
    Cookies.remove('refreshToken');
    Cookies.remove('accessToken');
    Cookies.remove('mock_username');
}

/**
 * Refresh the access token using the refresh token
 * POST /api/token/refresh/
 * @returns The new access token or null if refresh fails
 */
export async function refreshToken(): Promise<string | null> {
    try {
        const refreshTokenValue = Cookies.get('refreshToken');

        if (!refreshTokenValue) {
            console.warn('No refresh token available');
            return null;
        }

        const response = await axiosInstance.post('/token/refresh/', {
            refresh: refreshTokenValue
        });

        const newAccessToken = response.data.access;

        if (newAccessToken) {
            Cookies.set('accessToken', newAccessToken, {
                secure: true,
                sameSite: 'lax',
            });

            return newAccessToken;
        }

        return null;
    } catch (error) {
        console.error('Token refresh failed:', error);
        // Clear tokens on refresh failure
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        return null;
    }
} 