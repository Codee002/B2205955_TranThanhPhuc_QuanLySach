import { createApiClient } from "./api.service";
class BookService {
  constructor(baseUrl = "/api/sach") {
    this.api = createApiClient(baseUrl);
  }
  async getAll(
    page = 1,
    limit = 15,
    keyword = "",
    status = "on",
    theloai_id = "",
    tacgia_id = "",
    nhaxuatban_id = ""
  ) {
    return (
      await this.api.get("/", {
        params: {
          page,
          limit,
          keyword,
          status,
          theloai_id,
          tacgia_id,
          nhaxuatban_id,
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

  async getFilterOptions() {
    const result = await this.getAll(1, 1000, "", "on");
    const books = result.data || [];

    const categories = [
      ...new Set(books.map((b) => b.TheLoai).filter(Boolean)),
    ].sort();
    const authors = [
      ...new Set(books.map((b) => b.TenTacGia).filter(Boolean)),
    ].sort();
    const publishers = [
      ...new Set(books.map((b) => b.TenNXB).filter(Boolean)),
    ].sort();

    return { categories, authors, publishers };
  }
}
export default new BookService();
