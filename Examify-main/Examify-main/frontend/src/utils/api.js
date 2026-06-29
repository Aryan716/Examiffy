// src/utils/api.js
import axios from "axios";

export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 👈 critical for sending HTTP-only cookies
});

export default api;
