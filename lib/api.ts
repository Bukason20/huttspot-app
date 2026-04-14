import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log the full error response so you can see exactly what the backend says
    if (error.response) {
      console.error("❌ API Error:", {
        status: error.response.status,
        url: error.config?.url,
        sentData: error.config?.data, // ← what was sent
        backendMessage: error.response.data, // ← full backend response
      });
    }

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      // If backend returns an array of validation errors
      error.response?.data?.errors?.[0]?.message ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  },
);

export default api;
