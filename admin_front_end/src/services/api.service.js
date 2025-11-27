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
    withCredentials: true,
    timeout: 10000,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
