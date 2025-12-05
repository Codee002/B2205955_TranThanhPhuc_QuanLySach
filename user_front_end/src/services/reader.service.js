// src/services/reader.service.js

import { createApiClient } from "./api.service";

class ReaderService {
  constructor(baseUrl = "/api/docgia") {
    this.api = createApiClient(baseUrl);
  }

  async getAll(params = {}) {
    return (await this.api.get("/", { params })).data;
  }

  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  // LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI
  async me() {
    try {
      const res = await this.api.get("/me");
      const user = res.data.user;
      localStorage.setItem("currentUser", JSON.stringify(user));
      return user;
    } catch (err) {
      console.log("XÓA");
      console.log(err);
      localStorage.removeItem("currentUser");
      localStorage.removeItem("access_token");
      throw err;
    }
  }

  // Cập nhật trang cá nhân
  async updateProfile(data) {
    const response = await this.api.put("/updateProfile", data);
    console.log(response);
    localStorage.setItem("access_token", response.data.token);
    return response.data.updatedUser;
  }
}

export default new ReaderService();
