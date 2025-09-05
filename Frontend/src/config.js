// Frontend/src/config.js
const isDev = import.meta.env.VITE_DEV === "true";

export const API_BASE = isDev
  ? import.meta.env.VITE_LOCAL_API
  : import.meta.env.VITE_PROD_API;

export const SOCKET_URL = isDev
  ? import.meta.env.VITE_LOCAL_SOCKET
  : import.meta.env.VITE_PROD_SOCKET;
