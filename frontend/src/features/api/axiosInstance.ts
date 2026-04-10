import axios, { type AxiosInstance } from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_IKON_API_URL || "https://ikoncloud-dev.keross.com/ikon-api",
  headers: {
    "Content-Type": "application/json",
  },
  maxBodyLength: Infinity,
});
