// services/nhaxuatban.service.js (đã sửa)

const { ObjectId } = require("mongodb");
const ApiError = require("../api-error");

class NhaXuatBanService {
  constructor(client) {
    this.NhaXuatBan = client.db().collection("nhaxuatbans");
    this.Sach = client.db().collection("sachs");
  }

  extractNhaXuatBanData(payload) {
    const nhaxuatban = {
      TenNXB: payload.TenNXB?.trim(),
      DiaChi: payload.DiaChi?.trim(),
    };

    Object.keys(nhaxuatban).forEach(
      (key) => nhaxuatban[key] === undefined && delete nhaxuatban[key]
    );
    return nhaxuatban;
  }

  extractId(id) {
    return ObjectId.isValid(id) ? new ObjectId(id) : null;
  }

  // Kiểm tra tên NXB đã tồn tại chưa (không tính bản ghi hiện tại nếu có id)
  async isTenNXBExist(tenNXB, excludeId = null) {
    const query = {
      TenNXB: { $regex: `^${tenNXB}$`, $options: "i" },
    };

    if (excludeId && ObjectId.isValid(excludeId)) {
      query._id = { $ne: new ObjectId(excludeId) };
    }

    const exists = await this.NhaXuatBan.findOne(query);
    return !!exists;
  }

  async create(payload) {
    const nhaxuatban = this.extractNhaXuatBanData(payload);

    // Kiểm tra bắt buộc có tên
    if (!nhaxuatban.TenNXB) {
      throw new Error("Tên nhà xuất bản là bắt buộc");
    }

    // Kiểm tra trùng tên
    const tenExist = await this.isTenNXBExist(nhaxuatban.TenNXB);
    if (tenExist) {
      throw new ApiError("400", "Tên nhà xuất bản đã tồn tại");
    }

    const result = await this.NhaXuatBan.findOneAndUpdate(
      nhaxuatban,
      { $setOnInsert: { createdAt: new Date() } },
      { returnDocument: "after", upsert: true }
    );

    return result;
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) {
      throw new Error("ID không hợp lệ");
    }

    const filter = { _id: new ObjectId(id) };
    const updateData = this.extractNhaXuatBanData(payload);

    if (updateData.TenNXB !== undefined) {
      const tenExist = await this.isTenNXBExist(updateData.TenNXB, id);
      if (tenExist) {
        throw new Error("Tên nhà xuất bản đã tồn tại");
      }
    }

    const result = await this.NhaXuatBan.findOneAndUpdate(
      filter,
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      throw new Error("Không tìm thấy nhà xuất bản để cập nhật " + filter._id);
    }

    return result;
  }

  async find(filter) {
    const cursor = await this.NhaXuatBan.find(filter).toArray();

    const result = await Promise.all(
      cursor.map(async (nxb) => {
        const soLuongSach = await this.Sach.countDocuments({
          NhaXuatBan_id: nxb._id,
        });

        return {
          ...nxb,
          soLuongSach,
        };
      })
    );

    return result;
  }

  async findByName(name) {
    return await this.find({
      TenNXB: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findById(id) {
    return await this.NhaXuatBan.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async delete(id) {
    const sachDangDung = await this.Sach.findOne({
      NhaXuatBan_id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });

    if (sachDangDung) {
      throw new Error("Không thể xóa nhà xuất bản vì có sách đang sử dụng");
    }

    const result = await this.NhaXuatBan.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.NhaXuatBan.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = NhaXuatBanService;
