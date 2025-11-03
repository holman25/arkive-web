
import axios from "axios";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5171/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 15000,
});

axiosClient.interceptors.response.use(
  (r) => r,
  (err) => {
    return Promise.reject(err);
  }
);

export default axiosClient;
