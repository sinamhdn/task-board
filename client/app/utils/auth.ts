import axios from "axios";

interface User {
  id: number;
  uid: string;
  full_name: string;
  image_file?: string;
  image_path?: string;
  email?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

let currentUser: User | null = null;
let fetchPromise = null;

export async function getCurrentUser(token: string) {
  if (currentUser) {
    return currentUser;
  }

  fetchPromise = (async () => {
    try {
      const response = await fetch("/api/v1/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        currentUser = await response.json();
        return currentUser;
      }

      localStorage.removeItem("jwt");
      return null;
    } catch (error) {
      console.error("Error fetching current user :", error);
      return null;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

export async function fetchCurrentUser(token: string): Promise<User> {
  const response = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/v1/users/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
}

export function logout() {
  localStorage.removeItem("jwt");
  currentUser = null;
  window.location.href = "/";
}

export function getToken(): string | null {
  if (typeof window === "undefined" || !window.localStorage) return null;
  try {
    const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
    return token;
  } catch (error) {
    console.error("Error reading token from storage:", error);
    return null;
  }
}

export function setToken(token: string) {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.setItem("jwt", token);
  } catch (error) {
    console.error("Error setting token to storage:", error);
  }
}

export function removeToken() {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    localStorage.removeItem("jwt");
  } catch (error) {
    console.error("Error removing token from storage:", error);
  }
}

export function clearUserCache() {
  currentUser = null;
}
