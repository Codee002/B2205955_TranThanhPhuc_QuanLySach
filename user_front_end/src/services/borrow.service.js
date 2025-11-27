// src/services/borrow.service.js
import { createApiClient } from "./api.service";

class BorrowService {
  constructor(baseUrl = "/api/phieumuon") {
    this.api = createApiClient(baseUrl);
  }

  // Tạo phiếu mượn (chỉ 1 sách)
  async create(data) {
    return (await this.api.post("/", data)).data;
  }

  // Lấy tất cả phiếu mượn (có thể filter sau)
  async getAll({ page = 1, limit = 10, keyword = "", status = "" } = {}) {
    const params = {
      page,
      limit,
    };
    if (keyword.trim()) params.keyword = keyword.trim();
    if (status) params.status = status;

    return (await this.api.get("/", { params })).data;
  }

  // Lấy 1 phiếu mượn theo id
  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  // Cập nhật phiếu mượn (ví dụ: duyệt, trả sách...)
  async update(id, data) {
    return (await this.api.put(`/${id}`, data)).data;
  }

  // Xóa phiếu mượn (nếu cần)
  async delete(id) {
    return (await this.api.delete(`/${id}`)).data;
  }

  //   Lấy lịch sử mượn
  async getMyBorrows() {
    return (await this.api.get("/my")).data;
  }

  // Hủy phiếu mượn
  async cancel(id) {
    return (await this.api.patch(`/${id}/cancel`)).data;
  }
}

export default new BorrowService();
