// services/sach.service.js
const { ObjectId } = require("mongodb");
const path = require("path");
const fs = require("fs");

class SachService {
  constructor(client) {
    this.Sach = client.db().collection("sachs");
    this.TacGia = client.db().collection("tacgias");
    this.NhaXuatBan = client.db().collection("nhaxuatbans");
    this.TheLoai = client.db().collection("theloais");
    this.PhieuMuon = client.db().collection("phieumuons");
  }

  extractSachData(payload) {
    const sach = {
      TenSach: payload.TenSach?.trim(),
      MoTa: payload.MoTa?.trim(),
      DonGia: payload.DonGia ? Number(payload.DonGia) : undefined,
      SoLuong: payload.SoLuong ? Number(payload.SoLuong) : undefined,
      TacGia_id: payload.TacGia_id
        ? new ObjectId(payload.TacGia_id)
        : undefined,
      TheLoai_id: payload.TheLoai_id
        ? new ObjectId(payload.TheLoai_id)
        : undefined,
      NhaXuatBan_id: payload.NhaXuatBan_id
        ? new ObjectId(payload.NhaXuatBan_id)
        : undefined,
      NamXuatBan: payload.NamXuatBan ? Number(payload.NamXuatBan) : undefined,
      TrangThai: payload.TrangThai,
      Anh: payload.Anh || undefined,
    };

    Object.keys(sach).forEach(
      (key) => sach[key] === undefined && delete sach[key]
    );
    return sach;
  }

  extractId(id) {
    return ObjectId.isValid(id) ? new ObjectId(id) : null;
  }

  async populateSachs(sachs) {
    if (sachs.length === 0) return sachs;

    const tacgiaIds = [
      ...new Set(sachs.map((s) => s.TacGia_id).filter(Boolean)),
    ];
    const nxbIds = [
      ...new Set(sachs.map((s) => s.NhaXuatBan_id).filter(Boolean)),
    ];
    const tlIds = [...new Set(sachs.map((s) => s.TheLoai_id).filter(Boolean))];

    const [tacgias, nhaxuatbans, theloais] = await Promise.all([
      tacgiaIds.length > 0
        ? this.TacGia.find({
            _id: { $in: tacgiaIds.map((id) => new ObjectId(id)) },
          }).toArray()
        : [],
      nxbIds.length > 0
        ? this.NhaXuatBan.find({
            _id: { $in: nxbIds.map((id) => new ObjectId(id)) },
          }).toArray()
        : [],
      tlIds.length > 0
        ? this.TheLoai.find({
            _id: { $in: tlIds.map((id) => new ObjectId(id)) },
          }).toArray()
        : [],
    ]);

    const tacgiaMap = Object.fromEntries(
      tacgias.map((tg) => [tg._id.toString(), tg.HoTen || "Không rõ"])
    );
    const nxbMap = Object.fromEntries(
      nhaxuatbans.map((nxb) => [nxb._id.toString(), nxb.TenNXB || "Không rõ"])
    );
    const tlMap = Object.fromEntries(
      theloais.map((nxb) => [nxb._id.toString(), nxb.Ten || "Không rõ"])
    );

    return sachs.map((sach) => ({
      ...sach,
      TenTacGia: sach.TacGia_id
        ? tacgiaMap[sach.TacGia_id.toString()] || "Không rõ"
        : "—",
      TenNXB: sach.NhaXuatBan_id
        ? nxbMap[sach.NhaXuatBan_id.toString()] || "Không rõ"
        : "—",
      TheLoai: sach.TheLoai_id
        ? tlMap[sach.TheLoai_id.toString()] || "Không rõ"
        : "—",
    }));
  }

  // Lấy số lượng trong phiếu mượn
  async getBorrowStats(sachId) {
    const stats = await this.PhieuMuon.aggregate([
      {
        $match: {
          Sach_id: new ObjectId(sachId),
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
      "Đang mượn": 0,
      "Chờ duyệt": 0,
      "Đã trả": 0,
      "Đã hủy": 0,
    };

    stats.forEach((item) => {
      if (result.hasOwnProperty(item._id)) {
        result[item._id] = item.count;
      }
    });

    // Tính thêm số lượng còn lại thực tế
    const sach = await this.Sach.findOne({ _id: new ObjectId(sachId) });
    const total = sach?.SoLuong || 0;
    const dangMuonVaChoDuyet = result["Đang mượn"] + result["Chờ duyệt"];
    result.SoLuongConLai = Math.max(0, total - dangMuonVaChoDuyet);

    return result;
  }

  async find(filter = {}) {
    const cursor = await this.Sach.find(filter);
    let sachs = await cursor.toArray();
    return await this.populateSachs(sachs);
  }

  async findByName(name) {
    return this.find({
      TenSach: { $regex: new RegExp(name), $options: "i" },
    });
  }

  async findById(id) {
    const sach = await this.Sach.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    if (!sach) return null;
    const result = await this.populateSachs([sach]);
    const finalSach = result[0];

    finalSach.thongKePhieuMuon = await this.getBorrowStats(id);

    return finalSach;
  }

  async getAll(
    page = 1,
    limit = 10,
    ten = "",
    trangthai = "",
    theloai_id = "",
    tacgia_id = "",
    nhaxuatban_id = ""
  ) {
    const filter = {};

    if (ten) filter.TenSach = { $regex: ten, $options: "i" };
    if (trangthai) filter.TrangThai = trangthai;

    if (theloai_id && ObjectId.isValid(theloai_id)) {
      filter.TheLoai_id = new ObjectId(theloai_id);
    }
    if (tacgia_id && ObjectId.isValid(tacgia_id)) {
      filter.TacGia_id = new ObjectId(tacgia_id);
    }
    if (nhaxuatban_id && ObjectId.isValid(nhaxuatban_id)) {
      filter.NhaXuatBan_id = new ObjectId(nhaxuatban_id);
    }

    const total = await this.Sach.countDocuments(filter);
    const skip = (page - 1) * limit;

    const sachs = await this.Sach.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray();

    // Lấy thông tin tác giả, nhà xuất bản, thể loại
    const populated = await this.populateSachs(sachs);

    // Lấy số lượng sách
    for (let sach of populated) {
      sach.thongKePhieuMuon = await this.getBorrowStats(sach._id);
    }

    return {
      data: populated,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async create(payload) {
    const sach = this.extractSachData(payload);

    if (!sach.TenSach) throw new Error("Tên sách là bắt buộc");
    if (!sach.MoTa) throw new Error("Mô tả là bắt buộc");
    if (!sach.DonGia || sach.DonGia <= 0)
      throw new Error("Đơn giá phải lớn hơn 0");
    if (!sach.SoLuong || sach.SoLuong <= 0)
      throw new Error("Số lượng phải lớn hơn 0");
    if (!sach.TacGia_id) throw new Error("Vui lòng chọn tác giả");
    if (!sach.TheLoai_id) throw new Error("Vui lòng chọn thể loại");
    if (!sach.NhaXuatBan_id) throw new Error("Vui lòng chọn nhà xuất bản");
    if (!sach.NamXuatBan) throw new Error("Năm xuất bản là bắt buộc");
    if (sach.NamXuatBan > new Date().getFullYear())
      throw new Error(
        `Năm xuất bản không được lớn hơn ${new Date().getFullYear()}`
      );

    const exist = await this.Sach.findOne({
      TenSach: { $regex: `^${sach.TenSach}$`, $options: "i" },
    });
    if (exist) throw new Error("Tên sách đã tồn tại");

    if (!payload.Anh) throw new Error("Vui lòng tải lên ảnh bìa sách");
    const file = payload.Anh;
    const fileExt = path.extname(file.name).toLowerCase();
    const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    if (!allowed.includes(fileExt)) throw new Error("Chỉ chấp nhận file ảnh");
    if (file.size > 10 * 1024 * 1024)
      throw new Error("Ảnh không được lớn hơn 10MB");

    const fileName = `sach-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const uploadDir = path.join(__dirname, "../../public/uploads/sachs");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    await file.mv(path.join(uploadDir, fileName));

    sach.Anh = `/uploads/sachs/${fileName}`;
    sach.createdAt = new Date();
    sach.updatedAt = new Date();

    const result = await this.Sach.insertOne(sach);
    return this.findById(result.insertedId);
  }
  async update(id, payload) {
    if (!ObjectId.isValid(id)) throw new Error("ID sách không hợp lệ");

    const filter = { _id: new ObjectId(id) };
    const updateData = this.extractSachData(payload);

    // Kiểm tra tên sách
    if (updateData.TenSach) {
      const exist = await this.Sach.findOne({
        TenSach: { $regex: `^${updateData.TenSach}$`, $options: "i" },
        _id: { $ne: new ObjectId(id) },
      });
      if (exist) throw new Error("Tên sách đã tồn tại");
    }

    // Kiểm tra số lượng
    const stats = await this.getBorrowStats(id);
    const dangSuDung = stats["Đang mượn"] + stats["Chờ duyệt"];
    if (updateData.SoLuong < dangSuDung)
      throw new Error("Số lượng không được bé hơn sách đang mượn và duyệt");

    let newImagePath = null;

    // Nếu có file ảnh mới (người dùng chọn ảnh)
    if (payload.Anh && payload.Anh.name) {
      const file = payload.Anh;
      const fileExt = path
        .extname(file.originalname || file.name)
        .toLowerCase();
      const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      if (!allowed.includes(fileExt)) throw new Error("Chỉ chấp nhận file ảnh");

      const fileName = `sach-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
      const uploadDir = path.join(__dirname, "../../public/uploads/sachs");
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });

      await file.mv(path.join(uploadDir, fileName));
      newImagePath = `/uploads/sachs/${fileName}`;

      // === XÓA ẢNH CŨ  ===
      const oldSach = await this.Sach.findOne(filter);
      if (oldSach?.Anh && oldSach.Anh.includes("/uploads/sachs/")) {
        const oldPath = path.join(__dirname, "../../public", oldSach.Anh);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
            console.log("Đã xóa ảnh cũ:", oldPath);
          } catch (err) {
            console.warn("Không thể xóa ảnh cũ:", oldPath);
          }
        }
      }

      updateData.Anh = newImagePath;
    }

    updateData.updatedAt = new Date();
    const result = await this.Sach.findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: "after" }
    );

    return await this.findById(id);
  }

  async delete(id) {
    const sachDangDung = await this.PhieuMuon.findOne({
      Sach_id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });

    if (sachDangDung) {
      throw new Error("Không thể xóa sách vì có phiếu mượn đã sử dụng");
    }

    const sach = await this.findById(id);
    if (!sach) return null;

    if (sach.Anh && sach.Anh.includes("/uploads/sachs/")) {
      const filePath = path.join(__dirname, "../../public", sach.Anh);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Đã xóa ảnh cũ:", filePath);
      }
    }

    const result = await this.Sach.findOneAndDelete({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
    return result;
  }

  async deleteAll() {
    const result = await this.Sach.deleteMany({});
    return result.deletedCount;
  }

  async toggleStatus(id) {
    const objectId = this.extractId(id);
    if (!objectId) throw new Error("ID không hợp lệ");

    const sach = await this.Sach.findOne({ _id: objectId });
    if (!sach) return null;

    const newStatus = sach.TrangThai === "on" ? "off" : "on";

    const result = await this.Sach.updateOne(
      { _id: objectId },
      { $set: { TrangThai: newStatus } }
    );

    if (result.modifiedCount === 0) return null;

    return await this.Sach.findOne({ _id: objectId });
  }
}

module.exports = SachService;
