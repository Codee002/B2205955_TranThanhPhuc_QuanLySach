const { ObjectId } = require("mongodb");

class TacGiaService {
  constructor(client) {
    this.TacGia = client.db().collection("tacgias");
    this.Sach = client.db().collection("sachs");
  }

  extractTacGiaData(payload) {
    const tacgia = {
      HoTen: payload.HoTen?.trim(),
      DiaChi: payload.DiaChi?.trim(),
    };
    Object.keys(tacgia).forEach(
      (key) => tacgia[key] === undefined && delete tacgia[key]
    );
    return tacgia;
  }

  extractId(id) {
    return ObjectId.isValid(id) ? new ObjectId(id) : null;
  }

  async isHoTenExist(hoTen, excludeId = null) {
    const query = { HoTen: { $regex: `^${hoTen}$`, $options: "i" } };
    if (excludeId && ObjectId.isValid(excludeId)) {
      query._id = { $ne: new ObjectId(excludeId) };
    }
    return await this.TacGia.findOne(query);
  }

  async create(payload) {
    const tacgia = this.extractTacGiaData(payload);
    if (!tacgia.HoTen) throw new Error("Họ tên tác giả là bắt buộc");

    if (await this.isHoTenExist(tacgia.HoTen)) {
      throw new Error("Tên tác giả đã tồn tại");
    }

    const result = await this.TacGia.findOneAndUpdate(
      tacgia,
      { $setOnInsert: { createdAt: new Date() } },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) throw new Error("ID không hợp lệ");

    const update = this.extractTacGiaData(payload);
    if (update.HoTen !== undefined) {
      if (await this.isHoTenExist(update.HoTen, id)) {
        throw new Error("Tên tác giả đã tồn tại");
      }
    }

    const result = await this.TacGia.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...update, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!result) throw new Error("Không tìm thấy tác giả");
    return result;
  }
  async find(filter) {
    const tacgias = await this.TacGia.find(filter).toArray();

    const result = await Promise.all(
      tacgias.map(async (tacgia) => {
        const soLuongSach = await this.Sach.countDocuments({
          TacGia_id: tacgia._id,
        });

        return {
          ...tacgia,
          soLuongSach,
        };
      })
    );

    return result;
  }

  async findByName(name) {
    return await this.find({
      HoTen: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findById(id) {
    return await this.TacGia.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async delete(id) {
    const sachDangDung = await this.Sach.findOne({
      TacGia_id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });

    if (sachDangDung) {
      throw new Error("Không thể xóa tác giả vì có sách đang sử dụng");
    }

    const result = await this.TacGia.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.TacGia.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = TacGiaService;
