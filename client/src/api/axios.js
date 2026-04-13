import axios from "axios";

const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:5000/api"
  : (import.meta.env.VITE_API_URL || "http://localhost:5000/api");

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true
});

export default API;
