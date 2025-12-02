import { createApiClient } from "./api.service";

class BorrowService {
  constructor(baseUrl = "/api/phieumuon") {
    this.api = createApiClient(baseUrl);
  }

  async getAll({
    page = 1,
    limit = 10,
    keyword = "",
    status = "",
    overDue = "",
  } = {}) {
    const params = {
      page,
      limit,
    };
    if (keyword.trim()) params.keyword = keyword.trim();
    if (status) params.status = status;
    if (overDue != 0) params.overDue = overDue;

    return (await this.api.get("/", { params })).data;
  }

  async getBorrowStats() {
    return (await this.api.get(`/getBorrowStats`)).data;
  }

  // Lấy 1 phiếu mượn chi tiết (dùng cho trang chi tiết)
  async get(id) {
    return (await this.api.get(`/${id}`)).data;
  }

  // Tạo phiếu mượn (chỉ 1 sách)
  async createFormAdmin(data) {
    return (await this.api.post("/createFormAdmin", data)).data;
  }

  // Duyệt phiếu mượn
  async approve(id) {
    return (await this.api.patch(`/${id}/approve`)).data;
  }

  // Hủy phiếu mượn
  async reject(id) {
    return (await this.api.patch(`/${id}/reject`)).data;
  }

  // Xác nhận trả sách
  async return(id, soNgayTraMuon) {
    try {
      return (
        await this.api.patch(`/${id}/return`, { soNgayTraMuon: soNgayTraMuon })
      ).data;
    } catch (e) {
      console.log(e);
    }
  }
}

export default new BorrowService();
