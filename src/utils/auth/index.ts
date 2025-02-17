"use server";
import axiosInstance from '@/app/api/utils/axiosInstance';
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";

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
}

export async function getSession() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const decodedPayload = await decodeToken(accessToken);

  if (decodedPayload?.exp && Date.now() >= decodedPayload.exp * 1000) {
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) return null; // Stop loop if refreshToken is missing

    try {
      const response = await axiosInstance.post('/token/refresh/', { refresh: refreshToken });
      const newAccessToken = response.data.access;

      cookieStore.set("accessToken", newAccessToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      });

      return newAccessToken;
    } catch (error) {
      console.error("Token refresh failed:", error.message);
      return null;
    }
  }

  return accessToken || null;
}

export async function logout() {
  const cookieStore = cookies();
  cookieStore.delete("refreshToken");
  cookieStore.delete("accessToken");
}
