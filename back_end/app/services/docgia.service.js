const { ObjectId } = require("mongodb");

class DocGiaService {
  constructor(client) {
    this.DocGia = client.db().collection("docgias");
    this.PhieuMuon = client.db().collection("phieumuons");
  }

  // Trích xuất dữ liệu sạch từ payload
  extractDocGiaData(payload) {
    const docGia = {
      HoTen: payload.HoTen?.trim(),
      SoDienThoai: payload.SoDienThoai?.trim(),
      DiaChi: payload.DiaChi?.trim(),
      GioiTinh: payload.GioiTinh,
      TrangThai: payload.TrangThai || "active", // active / inactive
      Anh: payload.Anh || undefined,
      createdAt: payload.createdAt ? new Date(payload.createdAt) : new Date(),
      updatedAt: new Date(),
    };

    // Xóa các field undefined
    Object.keys(docGia).forEach(
      (key) => docGia[key] === undefined && delete docGia[key]
    );

    return docGia;
  }

  async getAll({ page = 1, limit = 10, keyword = "" } = {}) {
    const filter = {};

    if (keyword) {
      const regex = { $regex: keyword.trim(), $options: "i" };
      filter.$or = [
        { HoTen: regex },
        { MaDocGia: regex },
        { Email: regex },
        { SoDienThoai: regex },
      ];
    }

    // Đếm tổng
    const total = await this.DocGia.countDocuments(filter);

    const skip = (page - 1) * limit;

    const cursor = this.DocGia.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const data = await cursor.toArray();

    return {
      data,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getBorrowStats(docGiaId) {
    if (!ObjectId.isValid(docGiaId))
      return {
        "Chờ duyệt": 0,
        "Đang mượn": 0,
        "Đã trả": 0,
        "Đã hủy": 0,
        "Từ chối": 0,
      };

    const stats = await this.PhieuMuon.aggregate([
      {
        $match: {
          DocGia_id: new ObjectId(docGiaId),
        },
      },
      {
        $group: {
          _id: "$TrangThai",
          count: { $sum: 1 },
        },
      },
    ]).toArray();

    const result = {
      "Chờ duyệt": 0,
      "Đang mượn": 0,
      "Đã trả": 0,
      "Đã hủy": 0,
      "Từ chối": 0,
    };

    stats.forEach((item) => {
      if (result.hasOwnProperty(item._id)) {
        result[item._id] = item.count;
      }
    });

    return result;
  }

  async toggleStatus(id, payload) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID độc giả không hợp lệ");
    }

    const updateData = this.extractDocGiaData(payload);
    delete updateData.createdAt;

    updateData.updatedAt = new Date();
    const result = await this.DocGia.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) throw new Error("Không tìm thấy độc giả để cập nhật");
  }
}

module.exports = DocGiaService;
