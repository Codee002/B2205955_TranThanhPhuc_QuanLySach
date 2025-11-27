import { createApiClient } from "./api.service";

class UserService {
  constructor(baseUrl = "/api/auth") {
    this.api = createApiClient(baseUrl);
  }

  async getCurrentUser() {
    return (await this.api.get("/me")).data;
  }

  async updateProfile(data) {
    return (await this.api.put("/me", data)).data;
  }
}

export default new UserService();
