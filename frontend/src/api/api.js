import axios from "axios";

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL?.trim();

const api = axios.create({
  // Local development keeps working with the backend default port,
  // while deployments can point this at a hosted API via VITE_API_BASE_URL.
  baseURL: configuredBaseURL?.replace(/\/+$/, "") || "http://localhost:5000/api",
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
