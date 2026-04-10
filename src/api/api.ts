import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  },
});

api.interceptors.request.use((config) => {
  const requiresAuth = config.headers?.requiresAuth !== false;
  
  if (requiresAuth) {
    const token = sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  
  delete config.headers.requiresAuth;
  
  return config;
});

export default api;