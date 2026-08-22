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

export function getToken() {
  return localStorage.getItem("jwt");
}

export function setToken(token: string) {
  localStorage.setItem("jwt", token);
}

export function removeToken() {
  localStorage.removeItem("jwt");
}

export function clearUserCache() {
  currentUser = null;
}
