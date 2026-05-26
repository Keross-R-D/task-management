import axios, { type AxiosInstance } from "axios";

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_IKON_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  maxBodyLength: Infinity,
});
