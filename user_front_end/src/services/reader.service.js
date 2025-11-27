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
}

export default new ReaderService();
