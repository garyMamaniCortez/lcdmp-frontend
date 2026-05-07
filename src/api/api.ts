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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if(error.response?.data?.message !== "Usuario no encontrado o inactivo"){
        localStorage.removeItem('bakery_user');
        sessionStorage.removeItem('token');
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;