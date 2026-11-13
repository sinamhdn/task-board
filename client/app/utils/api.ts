import axios from "axios";

// Safe on both server and client — Vite substitutes this at build time
// backend's own address, from Node
const SERVER_SIDE_API = "http://127.0.0.1:8000";

export const API_URL = import.meta.env.SSR
  ? (import.meta.env.VITE_SERVER_API_URL ?? SERVER_SIDE_API) // absolute, Node → backend
  : (import.meta.env.VITE_API_URL ?? ""); // relative, browser → Vite proxy

export const axios_base = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Lazy — only runs in the browser, when the component/effect calls it
export const getSocketUrl = (): string => {
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/api/v1/ws?access_token=`;
};
