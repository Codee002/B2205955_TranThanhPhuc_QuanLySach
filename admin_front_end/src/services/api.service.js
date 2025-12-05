import axios from "axios";
const commonConfig = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};
export const createApiClient = (baseURL) => {
  const instance = axios.create({
    baseURL,
    ...commonConfig,
    withCredentials: true,
    timeout: 10000,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token") || "";
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return instance;
};
