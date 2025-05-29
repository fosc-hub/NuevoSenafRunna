"use server";
import axiosInstance from '@/app/api/utils/axiosInstance';
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";
import { getCookie, setCookie } from "cookies-next";
import { JwtPayload } from "jsonwebtoken";
import { UserPermissions } from './userZustand';

export async function decodeToken(accessToken?: string) {
  try {
    const token = accessToken || cookies().get("accessToken")?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default-secret");
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

  const cookieStore = cookies();

  cookieStore.set("refreshToken", tokens.refresh, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true,
  });

  cookieStore.set("accessToken", tokens.access, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true,
  });

  return tokens.access;
}

export const getSession = async (returnUserData: boolean = false): Promise<string | UserPermissions | null> => {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    if (!accessToken) {
      return null;
    }

    // If we just need the token, return it immediately
    if (!returnUserData) {
      return accessToken;
    }

    // Verify token and get user data
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET || 'default-secret') as JwtPayload;
    const currentTime = Math.floor(Date.now() / 1000);

    // If token is expired, try to refresh it
    if (decoded.exp && decoded.exp < currentTime) {
      const refreshToken = cookieStore.get('refreshToken')?.value;
      if (!refreshToken) {
        return null;
      }

      try {
        const response = await axiosInstance.post('/token/refresh/', {
          refresh: refreshToken
        });

        const newAccessToken = response.data.access;
        cookieStore.set('accessToken', newAccessToken, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: true,
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
  const cookieStore = cookies();
  cookieStore.delete("refreshToken");
  cookieStore.delete("accessToken");
}
