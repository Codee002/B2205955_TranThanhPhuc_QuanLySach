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
    localStorage.setItem("currentUser", JSON.stringify(user));
    return user;
  }

  // ĐĂNG XUẤT
  async logout() {
    await this.api.post("/logout");
    localStorage.removeItem("currentUser");
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
      throw err;
    }
  }

  // Helper: lấy user từ localStorage
  getCurrentUser() {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
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
