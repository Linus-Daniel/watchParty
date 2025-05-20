import axios from "axios";
const api = axios.create({
    baseURL: process.env.NODE_ENV === 'production' 
      ? "https://scenema-backend.onrender.com/api/" 
      : "http://localhost:5001/api/",
    withCredentials: true, // Important for cookies
  });
  
  // Add request interceptor to include token if available
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  
  // Add response interceptor to handle errors
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized errors (e.g., logout user)
        localStorage.removeItem("token");
      }
      return Promise.reject(error);
    }
  );
  
  export default api
  