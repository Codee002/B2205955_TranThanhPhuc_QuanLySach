// book.service.js
import { createApiClient } from "./api.service";

class BookService {
  constructor(baseUrl = "/api/sach") {
    this.api = createApiClient(baseUrl);
  }

  async getAll(page = 1, limit = 10, keyword = "", status = "") {
    return (
      await this.api.get("/", {
        params: {
          page,
          limit,
          keyword,
          status,
        },
      })
    ).data;
  }

  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  async deleteAll() {
    return (await this.api.delete("/")).data;
  }

  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  async toggleStatus(id) {
    return (await this.api.patch(`/${id}/toggle-status`)).data;
  }
}

export default new BookService();
