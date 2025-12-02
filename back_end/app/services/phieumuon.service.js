// services/phieumuon.service.js
const { ObjectId } = require("mongodb");
const SachService = require("./sach.service");

class PhieuMuonService {
  constructor(client) {
    this.PhieuMuon = client.db().collection("phieumuons");
    this.DocGia = client.db().collection("docgias");
    this.Sach = client.db().collection("sachs");
  }

  extractPhieuMuonData(payload) {
    const phieuMuon = {
      DocGia_id: payload.DocGia_id ? new ObjectId(payload.DocGia_id) : null,
      Sach_id: payload.Sach_id ? new ObjectId(payload.Sach_id) : null,
      TrangThai: payload.TrangThai || "Chờ duyệt",
      NgayMuon: new Date(),
      NgayDuyet: null,
      NgayTra: null,
      HanTra: null,
      SoNgayTraMuon: null,
    };

    Object.keys(phieuMuon).forEach(
      (key) => phieuMuon[key] === null && delete phieuMuon[key]
    );
    return phieuMuon;
  }

  // Tạo phiếu mượn
  async create(payload) {
    const Sach_id = payload.Sach_id;
    const DocGia_id = payload.DocGia_id;
    console.log("SERVICE");
    if (!DocGia_id || !Sach_id) {
      throw new Error("Thiếu thông tin độc giả hoặc sách");
    }

    const docGia = await this.DocGia.findOne({ _id: new ObjectId(DocGia_id) });
    if (!docGia) throw new Error("Không tìm thấy độc giả");

    const sach = await this.Sach.findOne({ _id: new ObjectId(Sach_id) });
    if (!sach) throw new Error("Không tìm thấy sách");

    if (sach.TrangThai == "off") throw new Error("Sách đang ẩn không thể mượn");

    // Giới hạn mượn 5 cuốn
    const maxBorrow = 5;
    const ongoing = await this.PhieuMuon.countDocuments({
      DocGia_id: new ObjectId(DocGia_id),
      TrangThai: { $in: ["Chờ duyệt", "Đang mượn"] },
    });

    if (ongoing >= maxBorrow) {
      throw new Error(`Chỉ được mượn tối đa ${maxBorrow} cuốn`);
    }

    // Kiểm tra trùng xem người này đã mượn quyển đó chưa
    const existingBorrow = await this.PhieuMuon.findOne({
      DocGia_id: new ObjectId(DocGia_id),
      Sach_id: new ObjectId(Sach_id),
      TrangThai: { $in: ["Chờ duyệt", "Đang mượn"] },
    });

    if (existingBorrow) {
      throw new Error(
        `Bạn đã mượn cuốn "${sach.TenSach}" này rồi, chưa thể mượn lại!`
      );
    }

    // Kiểm tra số lượng còn trống
    const borrowedCount = await this.PhieuMuon.countDocuments({
      Sach_id: new ObjectId(Sach_id),
      TrangThai: { $in: ["Chờ duyệt", "Đang mượn"] },
    });

    const available = (sach.SoLuong || 0) - borrowedCount;

    if (available <= 0) {
      throw new Error(`Sách "${sach.TenSach}" hiện đã hết`);
    }

    const phieuMuon = this.extractPhieuMuonData(payload);
    const result = await this.PhieuMuon.insertOne({
      ...phieuMuon,
    });

    // Trả về phiếu vừa tạo
    return await this.PhieuMuon.findOne({ _id: result.insertedId });
  }

  async find(phieuId, userId) {
    const objectId = ObjectId.isValid(phieuId) ? new ObjectId(phieuId) : null;
    if (!objectId) return null;

    // Lấy phiếu mượn
    const phieu = await this.PhieuMuon.findOne({ _id: objectId });
    if (!phieu) return null;

    // Dùng SachService để lấy đầy đủ thông tin sách
    const sachService = new SachService(this.PhieuMuon.db.client);
    const sachRaw = await sachService.Sach.findOne({ _id: phieu.Sach_id });
    const [sach] = sachRaw ? await sachService.populateSachs([sachRaw]) : [{}];

    // Lấy thông tin độc giả
    const docGia = await this.DocGia.findOne({ _id: phieu.DocGia_id });

    // Tính số ngày quá hạn + tiền phạt (nếu có)
    let SoNgayQuaHan = 0;
    let TienPhat = 0;
    const PHAT_MOI_NGAY = 10000;

    if (phieu.HanTra) {
      const hanTra = new Date(phieu.HanTra);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (phieu.TrangThai === "Đang mượn" && today > hanTra) {
        SoNgayQuaHan = Math.floor((today - hanTra) / (1000 * 60 * 60 * 24));
        TienPhat = SoNgayQuaHan * PHAT_MOI_NGAY;
      }

      // Nếu đã trả nhưng trả muộn
      if (phieu.TrangThai === "Đã trả" && phieu.NgayTra) {
        const ngayTra = new Date(phieu.NgayTra);
        if (ngayTra > hanTra) {
          SoNgayQuaHan = Math.floor((ngayTra - hanTra) / (1000 * 60 * 60 * 24));
          TienPhat = SoNgayQuaHan * PHAT_MOI_NGAY;
        }
      }
    }

    return {
      ...phieu,
      SoNgayQuaHan,
      TienPhat,
      sach: {
        _id: sach._id || null,
        TenSach: sach.TenSach || "Không rõ",
        Anh: sach.Anh || "/images/no-image.jpg",
        TacGia: sach.TenTacGia || "Không rõ",
        TheLoai: sach.TheLoai || "Không rõ",
        TenNXB: sach.TenNXB || "Không rõ",
      },
      docGia: {
        _id: docGia?._id || null,
        HoTen: docGia?.HoTen || "Không rõ",
        MaDocGia: docGia?.MaDocGia || "—",
        SoDienThoai: docGia?.SoDienThoai || "—",
      },
    };
  }

  async findById(id) {
    return await this.PhieuMuon.findOne({
      _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
    });
  }

  //   Lấy phiếu mượn của user
  async getMyBorrowsWithDetails(userId) {
    const objectId = ObjectId.isValid(userId) ? new ObjectId(userId) : null;
    if (!objectId) throw new Error("ID người dùng không hợp lệ");

    // Lấy phiếu mượn
    const phieuMuons = await this.PhieuMuon.find({
      DocGia_id: objectId,
    })
      .sort({ NgayMuon: -1 })
      .toArray();

    if (phieuMuons.length === 0) return [];

    // Lấy danh sách sách từ phiếu mượn
    const sachIds = [
      ...new Set(phieuMuons.map((p) => p.Sach_id).filter(Boolean)),
    ];

    const sachService = new SachService(this.PhieuMuon.db.client);

    const sachs = await sachService.Sach.find({
      _id: { $in: sachIds.map((id) => new ObjectId(id)) },
    }).toArray();

    const populatedSachs = await sachService.populateSachs(sachs);

    const sachMap = Object.fromEntries(
      populatedSachs.map((s) => [s._id.toString(), s])
    );

    const docGia = await this.DocGia.findOne({ _id: objectId });

    // Gắn thông tin vào từng phiếu
    return phieuMuons.map((phieu) => {
      const sach = sachMap[phieu.Sach_id?.toString()] || {};

      return {
        ...phieu,
        sach: {
          _id: sach._id,
          TenSach: sach.TenSach || "Không rõ",
          Anh: sach.Anh || "/images/no-image.jpg",
          TacGia: sach.TenTacGia || "Không rõ",
          TheLoai: sach.TheLoai || "Không rõ",
          TenNXB: sach.TenNXB || "Không rõ",
        },
        docGia: {
          _id: docGia._id,
          HoTen: docGia.HoTen || "Không rõ",
          MaDocGia: docGia.MaDocGia || "—",
          SoDienThoai: docGia.SoDienThoai || "—",
        },
      };
    });
  }

  // Lấy tất cả phiếu
  async findAll() {
    // Lấy tất cả phiếu mượn, sắp xếp mới nhất trước
    const phieuMuons = await this.PhieuMuon.find({})
      .sort({ NgayMuon: -1 })
      .toArray();

    if (phieuMuons.length === 0) return [];

    // Lấy danh sách ID sách và độc giả để populate
    const sachIds = [
      ...new Set(phieuMuons.map((p) => p.Sach_id).filter(Boolean)),
    ];
    const docGiaIds = [
      ...new Set(phieuMuons.map((p) => p.DocGia_id).filter(Boolean)),
    ];

    const sachService = new SachService(this.PhieuMuon.db.client);

    // Lấy thông tin sách đã populate (có tên tác giả, thể loại, NXB)
    const sachsRaw = await sachService.Sach.find({
      _id: { $in: sachIds.map((id) => new ObjectId(id)) },
    }).toArray();

    const populatedSachs = await sachService.populateSachs(sachsRaw);
    const sachMap = Object.fromEntries(
      populatedSachs.map((s) => [s._id.toString(), s])
    );

    // Lấy thông tin độc giả
    const docGias = await this.DocGia.find({
      _id: { $in: docGiaIds.map((id) => new ObjectId(id)) },
    }).toArray();

    const docGiaMap = Object.fromEntries(
      docGias.map((dg) => [dg._id.toString(), dg])
    );

    // Tính tiền phạt, ngày quá hạn cho từng phiếu
    const PHAT_MOI_NGAY = 10000;

    return phieuMuons.map((phieu) => {
      const sach = sachMap[phieu.Sach_id?.toString()] || {};
      const docGia = docGiaMap[phieu.DocGia_id?.toString()] || {};

      let SoNgayQuaHan = 0;
      let TienPhat = 0;

      if (phieu.HanTra) {
        const hanTra = new Date(phieu.HanTra);

        let SoNgayQuaHan = 0;
        let TienPhat = 0;

        console.log("HẠN TRẢ");
        console.log(hanTra);
        if (phieu.TrangThai === "Đang mượn") {
          const now = new Date();
          console.log("HIỆN TẠI");
          console.log(now);
          if (now > hanTra) {
            const diffMs = now - hanTra;

            SoNgayQuaHan = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            TienPhat = SoNgayQuaHan * PHAT_MOI_NGAY;
            console.log("HIỆN TẠI KẾT QUẢ");
            console.log(diffMs);
            console.log(SoNgayQuaHan);
          }
        } else if (phieu.TrangThai === "Đã trả" && phieu.NgayTra) {
          const ngayTra = new Date(phieu.NgayTra);
          console.log("ĐÃ TRẢ");
          console.log(now);
          if (ngayTra > hanTra) {
            const diffMs = ngayTra - hanTra;
            SoNgayQuaHan = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            TienPhat = SoNgayQuaHan * PHAT_MOI_NGAY;
            console.log("ĐÃ TRẢ KẾT QUẢ");
            console.log(diffMs);
            console.log(SoNgayQuaHan);
          }
        }
      }

      return {
        ...phieu,
        SoNgayQuaHan,
        TienPhat,
        sach: {
          _id: sach._id || null,
          TenSach: sach.TenSach || "Không rõ",
          Anh: sach.Anh || "/images/no-image.jpg",
          TacGia: sach.TenTacGia || "Không rõ",
          TheLoai: sach.TheLoai || "Không rõ",
          TenNXB: sach.TenNXB || "Không rõ",
        },
        docGia: {
          _id: docGia._id || null,
          HoTen: docGia.HoTen || "Không rõ",
          MaDocGia: docGia.MaDocGia || "—",
          Email: docGia.Email || "—",
          SoDienThoai: docGia.SoDienThoai || "—",
        },
      };
    });
  }
  async findAllPaginated({
    page = 1,
    limit = 10,
    keyword = "",
    status = "",
    overDue = 0,
  } = {}) {
    // Ép kiểu an toàn
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(1000, Math.max(1, parseInt(limit) || 10)); // giới hạn tối đa 1000
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
      // Join sách
      {
        $lookup: {
          from: "sachs",
          localField: "Sach_id",
          foreignField: "_id",
          as: "sach",
        },
      },
      { $unwind: { path: "$sach", preserveNullAndEmptyArrays: true } },

      // Join độc giả
      {
        $lookup: {
          from: "docgias",
          localField: "DocGia_id",
          foreignField: "_id",
          as: "docgia",
        },
      },
      { $unwind: { path: "$docgia", preserveNullAndEmptyArrays: true } },
    ];

    // Tìm kiếm
    if (keyword) {
      const regex = { $regex: keyword.trim(), $options: "i" };
      pipeline.push({
        $match: {
          $or: [
            { "sach.TenSach": regex },
            { "docgia.HoTen": regex },
            { "docgia.MaDocGia": regex },
          ],
        },
      });
    }

    // Lọc trạng thái
    if (status && status !== "all") {
      pipeline.push({ $match: { TrangThai: status } });
    }

    // === LỌC THEO overDue (quá hạn) ===
    if (overDue === 1 || overDue === "1") {
      pipeline.push({
        $addFields: {
          SoNgayQuaHan: {
            $cond: {
              if: { $eq: ["$TrangThai", "Đang mượn"] },
              then: {
                $ceil: {
                  $divide: [
                    { $subtract: [new Date(), "$HanTra"] },
                    1000 * 60 * 60 * 24,
                  ],
                },
              },
              else: {
                $cond: {
                  if: { $eq: ["$TrangThai", "Đã trả"] },
                  then: {
                    $ceil: {
                      $divide: [
                        { $subtract: ["$NgayTra", "$HanTra"] },
                        1000 * 60 * 60 * 24,
                      ],
                    },
                  },
                  else: 0,
                },
              },
            },
          },
        },
      });

      pipeline.push({
        $match: {
          $expr: { $gt: ["$SoNgayQuaHan", 0] },
        },
      });
    }

    // === ĐẾM TỔNG TRƯỚC KHI PHÂN TRANG ===
    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await this.PhieuMuon.aggregate(countPipeline).toArray();
    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    // === PHÂN TRANG ===
    pipeline.push(
      { $sort: { NgayMuon: -1 } },
      { $skip: skip },
      { $limit: limitNum }
    );

    const rawData = await this.PhieuMuon.aggregate(pipeline).toArray();

    const processedData = await this.populatePhieuDetails(rawData);

    return {
      data: processedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  }

  // Hỗ trợ lấy thông tin cho phiếu
  async populatePhieuDetails(phieuMuons) {
    if (phieuMuons.length === 0) return [];

    const sachIds = [
      ...new Set(phieuMuons.map((p) => p.Sach_id).filter(Boolean)),
    ];
    const docGiaIds = [
      ...new Set(phieuMuons.map((p) => p.DocGia_id).filter(Boolean)),
    ];

    const sachService = new SachService(this.PhieuMuon.db.client);
    const sachsRaw = await sachService.Sach.find({
      _id: { $in: sachIds.map((id) => new ObjectId(id)) },
    }).toArray();
    const populatedSachs = await sachService.populateSachs(sachsRaw);
    const sachMap = Object.fromEntries(
      populatedSachs.map((s) => [s._id.toString(), s])
    );

    const docGias = await this.DocGia.find({
      _id: { $in: docGiaIds.map((id) => new ObjectId(id)) },
    }).toArray();
    const docGiaMap = Object.fromEntries(
      docGias.map((d) => [d._id.toString(), d])
    );

    const PHAT_MOI_NGAY = 10000;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return phieuMuons.map((phieu) => {
      const sach = sachMap[phieu.Sach_id?.toString()] || {};
      const docGia = docGiaMap[phieu.DocGia_id?.toString()] || {};

      let SoNgayQuaHan = 0;
      let TienPhat = 0;

      if (phieu.HanTra) {
        const hanTra = new Date(phieu.HanTra);
        if (phieu.TrangThai === "Đang mượn" && today > hanTra) {
          SoNgayQuaHan = Math.floor((today - hanTra) / (1000 * 60 * 60 * 24));
          TienPhat = SoNgayQuaHan * PHAT_MOI_NGAY;
        }
        if (phieu.TrangThai === "Đã trả" && phieu.NgayTra) {
          const ngayTra = new Date(phieu.NgayTra);
          if (ngayTra > hanTra) {
            SoNgayQuaHan = Math.floor(
              (ngayTra - hanTra) / (1000 * 60 * 60 * 24)
            );
            TienPhat = SoNgayQuaHan * PHAT_MOI_NGAY;
          }
        }
      }

      return {
        ...phieu,
        SoNgayQuaHan,
        TienPhat,
        sach: {
          _id: sach._id || null,
          TenSach: sach.TenSach || "Không rõ",
          Anh: sach.Anh || "/images/no-image.jpg",
          TacGia: sach.TenTacGia || "Không rõ",
        },
        docGia: {
          _id: docGia._id || null,
          HoTen: docGia.HoTen || "Không rõ",
          MaDocGia: docGia.MaDocGia || "—",
        },
      };
    });
  }

  // LẤY TỔNG SỐ PHIẾU THEO TRẠNG THÁI
  async getBorrowStats() {
    const stats = await this.PhieuMuon.aggregate([
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

    // Thêm số phiếu mượn hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const homNay = await this.PhieuMuon.countDocuments({
      NgayMuon: { $gte: today, $lt: tomorrow },
    });

    result.homNay = homNay;

    return result;
  }

  // Duyệt phiếu mượn
  async approve(phieuId, adminId) {
    const objectId = ObjectId.isValid(phieuId) ? new ObjectId(phieuId) : null;
    if (!objectId) throw new Error("ID phiếu không hợp lệ");

    const phieu = await this.PhieuMuon.findOne({ _id: objectId });
    if (!phieu) throw new Error("Không tìm thấy phiếu mượn");
    if (phieu.TrangThai !== "Chờ duyệt") {
      throw new Error("Chỉ có thể duyệt phiếu đang ở trạng thái Chờ duyệt");
    }

    const ngayDuyet = new Date();
    const hanTra = new Date(ngayDuyet);
    hanTra.setDate(hanTra.getDate() + 7); // Hạn trả = 7 ngày sau ngày duyệt

    const result = await this.PhieuMuon.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          TrangThai: "Đang mượn",
          NgayDuyet: ngayDuyet,
          HanTra: hanTra,
          NguoiDuyet: new ObjectId(adminId),
        },
      },
      { returnDocument: "after" }
    );

    return result ? await this.populateSinglePhieu(result) : null;
  }

  // Từ chối phiếu mượn
  async reject(phieuId, adminId) {
    const objectId = ObjectId.isValid(phieuId) ? new ObjectId(phieuId) : null;
    if (!objectId) throw new Error("ID phiếu không hợp lệ");

    const phieu = await this.PhieuMuon.findOne({ _id: objectId });
    if (!phieu) throw new Error("Không tìm thấy phiếu mượn");
    if (phieu.TrangThai !== "Chờ duyệt") {
      throw new Error("Chỉ có thể từ chối phiếu đang ở trạng thái Chờ duyệt");
    }

    const result = await this.PhieuMuon.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          TrangThai: "Từ chối",
          NgayDuyet: new Date(),
          NguoiDuyet: new ObjectId(adminId),
        },
      },
      { returnDocument: "after" }
    );

    return result ? await this.populateSinglePhieu(result) : null;
  }

  // Hủy đơn
  async cancel(phieuId, adminId) {
    const objectId = ObjectId.isValid(phieuId) ? new ObjectId(phieuId) : null;
    if (!objectId) throw new Error("ID phiếu không hợp lệ");

    const phieu = await this.PhieuMuon.findOne({ _id: objectId });
    if (!phieu) throw new Error("Không tìm thấy phiếu mượn");
    if (phieu.TrangThai !== "Chờ duyệt") {
      throw new Error("Chỉ có thể hủy phiếu đang ở trạng thái Chờ duyệt");
    }

    const result = await this.PhieuMuon.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          TrangThai: "Đã hủy",
          NgayDuyet: new Date(),
          NguoiDuyet: new ObjectId(adminId),
        },
      },
      { returnDocument: "after" }
    );

    return result ? await this.populateSinglePhieu(result) : null;
  }

  // Xác nhận trả sách
  async returnBook(phieuId, adminId, soNgayTraMuon) {
    const objectId = ObjectId.isValid(phieuId) ? new ObjectId(phieuId) : null;
    if (!objectId) throw new Error("ID phiếu không hợp lệ");

    const phieu = await this.PhieuMuon.findOne({ _id: objectId });
    if (!phieu) throw new Error("Không tìm thấy phiếu mượn");
    if (phieu.TrangThai !== "Đang mượn") {
      throw new Error("Chỉ có thể xác nhận trả sách khi đang mượn");
    }

    const result = await this.PhieuMuon.findOneAndUpdate(
      { _id: objectId },
      {
        $set: {
          TrangThai: "Đã trả",
          SoNgayTraMuon: soNgayTraMuon,
          NgayTra: new Date(),
          NguoiXacNhanTra: new ObjectId(adminId),
        },
      },
      { returnDocument: "after" }
    );

    return result ? await this.populateSinglePhieu(result) : null;
  }

  // Hàm hỗ trợ: populate lại thông tin đầy đủ sau khi cập nhật
  async populateSinglePhieu(phieu) {
    const sachService = new SachService(this.PhieuMuon.db.client);
    const sachRaw = await sachService.Sach.findOne({ _id: phieu.Sach_id });
    const [sach] = sachRaw ? await sachService.populateSachs([sachRaw]) : [{}];

    const docGia = await this.DocGia.findOne({ _id: phieu.DocGia_id });

    let SoNgayQuaHan = 0;
    let TienPhat = 0;
    const PHAT_MOI_NGAY = 10000;

    if (phieu.HanTra) {
      const hanTra = new Date(phieu.HanTra);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (phieu.TrangThai === "Đang mượn" && today > hanTra) {
        SoNgayQuaHan = Math.floor((today - hanTra) / (1000 * 60 * 60 * 24));
        TienPhat = SoNgayQuaHan * PHAT_MOI_NGAY;
      }
      if (phieu.TrangThai === "Đã trả" && phieu.NgayTra) {
        const ngayTra = new Date(phieu.NgayTra);
        if (ngayTra > hanTra) {
          SoNgayQuaHan = Math.floor((ngayTra - hanTra) / (1000 * 60 * 60 * 24));
          TienPhat = SoNgayQuaHan * PHAT_MOI_NGAY;
        }
      }
    }

    return {
      ...phieu,
      SoNgayQuaHan,
      TienPhat,
      sach: {
        _id: sach._id || null,
        TenSach: sach.TenSach || "Không rõ",
        Anh: sach.Anh || "/images/no-image.jpg",
        TacGia: sach.TenTacGia || "Không rõ",
        TheLoai: sach.TheLoai || "Không rõ",
        TenNXB: sach.TenNXB || "Không rõ",
      },
      docGia: {
        _id: docGia?._id || null,
        HoTen: docGia?.HoTen || "Không rõ",
        MaDocGia: docGia?.MaDocGia || "—",
      },
    };
  }
}

module.exports = PhieuMuonService;
