// src/services/auth.service.js
import { createApiClient } from "./api.service";

class AuthService {
  constructor(baseUrl = "/api/auth") {
    this.api = createApiClient(baseUrl);
  }

  // ĐĂNG KÝ ĐỘC GIẢ
  async register(data) {
    return (await this.api.post("/register", data)).data;
  }

  // ĐĂNG NHẬP ĐỘC GIẢ
  async loginDocGia({ username, password }) {
    const res = await this.api.post("/login-docgia", { username, password });
    const user = res.data.user;
    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  }

  // ĐĂNG NHẬP ADMIN
  async loginAdmin({ username, password }) {
    const res = await this.api.post("/login-admin", { username, password });
    const user = res.data.user;
    const token = res.data.token;

    localStorage.setItem("access_token", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  }

  // ĐĂNG XUẤT
  async logout() {
    await this.api.post("/logout");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("access_token");
  }

  // LẤY THÔNG TIN NGƯỜI DÙNG HIỆN TẠI
  async me() {
    try {
      const res = await this.api.get("/me");
      const user = res.data.user;
      localStorage.setItem("currentUser", JSON.stringify(user));
      return user;
    } catch (err) {
      localStorage.removeItem("currentUser");
      localStorage.removeItem("access_token");
      throw err;
    }
  }

  // Helper: lấy user từ localStorage
  getCurrentUser() {
    const user = localStorage.getItem("currentUser");
    const token = localStorage.getItem("access_token");
    if (!user || !token) return null;
    return JSON.parse(user);
  }

  isLoggedIn() {
    return !!this.getCurrentUser();
  }

  isAdmin() {
    return this.getCurrentUser()?.type === "admin";
  }

  isDocGia() {
    return this.getCurrentUser()?.type === "docgia";
  }
}

export default new AuthService();
