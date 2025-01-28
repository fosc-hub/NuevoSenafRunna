"use server";
import axiosInstance from '@/app/api/utils/axiosInstance';
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";
//import axiosInstance from '../api/utils/axiosInstance';


export async function decodeToken(accessToken?: string) {
  try {
    const token = (accessToken || await cookies().get("accessToken")?.value) as string;
    const decoded = jwt.decode(token); // Decodes the payload without verifying

    return decoded;
  } catch (e) {
    return null;
  }
}

export async function login(username: string, password: string) {
  const response =  await axiosInstance.post('/token/', { username, password });

  const tokens = {
    refresh: response.data.refresh,
    access: response.data.access,
  };

  // Save the tokens in cookies
  cookies().set("refreshToken", tokens.refresh, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true,
  });

  cookies().set("accessToken", tokens.access, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true,
  });
}

export async function getSession() {
  const accessToken = await cookies().get("accessToken")?.value;
  const decodedPayload = await decodeToken(accessToken);

  if (typeof decodedPayload !== 'string' && decodedPayload?.exp && Date.now() >= decodedPayload.exp * 1000) {
    const refreshToken = await cookies().get("refreshToken")?.value;
    if (refreshToken) {
      const response = await axiosInstance.post('/token/refresh/', { refresh: refreshToken });
      const newAccessToken = response.data.access;

      // Save the new access token in cookies
      cookies().set("accessToken", newAccessToken, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: true,
      });

      return newAccessToken;
    }
  }

  if (!accessToken) return null;
  return accessToken;
}

export async function logout() {
  // Destroy the tokens
  cookies().delete("refreshToken");
  cookies().delete("accessToken");
}
