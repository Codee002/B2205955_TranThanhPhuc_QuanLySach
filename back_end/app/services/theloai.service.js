const { ObjectId } = require("mongodb");

class TheLoaiService {
  constructor(client) {
    this.TheLoai = client.db().collection("theloais");
    this.Sach = client.db().collection("sachs");
  }

  extractTheLoaiData(payload) {
    const theloai = {
      Ten: payload.Ten?.trim(),
    };
    Object.keys(theloai).forEach(
      (key) => theloai[key] === undefined && delete theloai[key]
    );
    return theloai;
  }

  extractId(id) {
    return ObjectId.isValid(id) ? new ObjectId(id) : null;
  }

  async isTenExist(ten, excludeId = null) {
    const query = { Ten: { $regex: `^${ten}$`, $options: "i" } };
    if (excludeId && ObjectId.isValid(excludeId)) {
      query._id = { $ne: new ObjectId(excludeId) };
    }
    return await this.TheLoai.findOne(query);
  }

  async create(payload) {
    const theloai = this.extractTheLoaiData(payload);
    if (!theloai.Ten) throw new Error("Tên thể loại là bắt buộc");

    if (await this.isTenExist(theloai.Ten)) {
      throw new Error("Tên thể loại đã tồn tại");
    }

    const result = await this.TheLoai.findOneAndUpdate(
      theloai,
      { $setOnInsert: { createdAt: new Date() } },
      { returnDocument: "after", upsert: true }
    );
    return result;
  }

  async update(id, payload) {
    if (!ObjectId.isValid(id)) throw new Error("ID không hợp lệ");

    const update = this.extractTheLoaiData(payload);
    if (update.Ten !== undefined) {
      if (await this.isTenExist(update.Ten, id)) {
        throw new Error("Tên thể loại đã tồn tại");
      }
    }

    const result = await this.TheLoai.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { ...update, updatedAt: new Date() } },
      { returnDocument: "after" }
    );
    if (!result) throw new Error("Không tìm thấy thể loại");
    return result;
  }

  async find(filter) {
    const cursor = await this.TheLoai.find(filter).toArray();

    const result = await Promise.all(
      cursor.map(async (theloai) => {
        const soLuongSach = await this.Sach.countDocuments({
          TheLoai_id: theloai._id,
        });

        return {
          ...theloai,
          soLuongSach,
        };
      })
    );

    return result;
  }

  async findByName(name) {
    return await this.find({
      Ten: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findById(id) {
    return await this.TheLoai.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  async delete(id) {
    const sachDangDung = await this.Sach.findOne({
      TheLoai_id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });

    if (sachDangDung) {
      throw new Error("Không thể xóa thể loại vì có sách đang sử dụng");
    }

    const result = await this.TheLoai.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.TheLoai.deleteMany({});
    return result.deletedCount;
  }
}

module.exports = TheLoaiService;
