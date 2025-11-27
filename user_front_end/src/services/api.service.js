import axios from "axios";
const commonConfig = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};
export const createApiClient = (baseURL) => {
  return axios.create({
    baseURL,
    ...commonConfig,
    timeout: 10000,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // api.interceptors.request.use((config) => {
  //   const token = localStorage.getItem("adminToken");
  //   if (token) {
  //     config.headers.Authorization = `Bearer ${token}`;
  //   }
  //   return config;
  // });

  // return api;
};
