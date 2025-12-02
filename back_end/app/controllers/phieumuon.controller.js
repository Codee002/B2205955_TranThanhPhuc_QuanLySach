const ApiError = require("../api-error");
const PhieuMuonService = require("../services/phieumuon.service");
const { ObjectId } = require("mongodb");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  const Sach_id = req.body.Sach_id;
  const DocGia_id = req.user._id;

  if (!Sach_id) {
    return next(
      new ApiError(400, "Thiếu thông tin độc giả hoặc sách cần mượn")
    );
  }

  try {
    const phieuMuonService = new PhieuMuonService(MongoDB.client);
    const payload = { Sach_id, DocGia_id };
    const phieuMuon = await phieuMuonService.create(payload);

    return res.status(201).send({
      message: "Tạo phiếu mượn thành công",
      phieuMuon,
    });
  } catch (error) {
    console.error("Lỗi tạo phiếu mượn:", error.message);
    return next(new ApiError(400, error.message));
  }
};

exports.createFormAdmin = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  const Sach_id = req.body.Sach_id;
  const DocGia_id = req.body.DocGia_id;

  if (!Sach_id) {
    return next(
      new ApiError(400, "Thiếu thông tin độc giả hoặc sách cần mượn")
    );
  }

  try {
    const phieuMuonService = new PhieuMuonService(MongoDB.client);
    const payload = { Sach_id, DocGia_id };
    const phieuMuon = await phieuMuonService.create(payload);

    return res.status(201).send({
      message: "Tạo phiếu mượn thành công",
      phieuMuon,
    });
  } catch (error) {
    console.error("Lỗi tạo phiếu mượn:", error.message);
    return next(new ApiError(400, error.message));
  }
}; // controllers/phieumuon.controller.js
exports.findAll = async (req, res, next) => {
  console.log("Người dùng:", req.user?.HoTen, req.user?.type);

  if (!req.user) {
    return next(new ApiError(401, "Chưa đăng nhập"));
  }

  // LẤY TỪ QUERY – chuẩn REST cho GET
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10; // ← ĐÂY LÀ CHÌA KHÓA!
  const keyword = (req.query.keyword || "").toString().trim();
  const status = (req.query.status || "").toString().trim();
  const overDue = req.query.overDue || 0;

  // Bảo vệ limit quá lớn (tránh crash server)
  const safeLimit = limit > 1000 ? 1000 : limit;

  try {
    const phieuMuonService = new PhieuMuonService(MongoDB.client);
    const result = await phieuMuonService.findAllPaginated({
      page,
      limit: safeLimit,
      keyword,
      status,
      overDue,
    });

    return res.json({
      message: "Lấy danh sách phiếu mượn thành công",
      data: result.data,

      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.pagination.total,
      totalPages: result.pagination.totalPages,
    });
  } catch (error) {
    console.error("Lỗi findAll phiếu mượn:", error);
    return next(new ApiError(500, error.message));
  }
};
exports.getBorrowStats = async (req, res, next) => {
  try {
    const phieuMuonService = new PhieuMuonService(MongoDB.client);
    const result = await phieuMuonService.getBorrowStats(req.query);
    res.send(result);
  } catch (err) {
    next(new ApiError(500, err.message || "Lỗi khi lấy danh sách độc giả"));
  }
};

exports.findOne = async (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Vui lòng đăng nhập"));
  }

  const { id } = req.params;
  if (!id || !ObjectId.isValid(id)) {
    return next(new ApiError(400, "ID phiếu mượn không hợp lệ"));
  }

  try {
    const phieuMuonService = new PhieuMuonService(MongoDB.client);
    const phieu = await phieuMuonService.find(id, req.user._id);

    if (!phieu) {
      return next(new ApiError(404, "Không tìm thấy phiếu mượn"));
    }

    // Kiểm tra quyền: chỉ được xem phiếu của chính mình
    if (
      phieu.DocGia_id.toString() !== req.user._id &&
      req.user.type != "admin"
    ) {
      return next(new ApiError(403, "Bạn không có quyền xem phiếu này"));
    }

    return res.send({
      message: "Lấy chi tiết phiếu mượn thành công",
      data: phieu,
    });
  } catch (error) {
    console.error("Lỗi lấy chi tiết phiếu:", error);
    return next(new ApiError(500, error.message));
  }
};

exports.getMyBorrows = async (req, res, next) => {
  if (!req.user?._id) {
    return next(new ApiError(401, "Vui lòng đăng nhập"));
  }

  try {
    const phieuMuonService = new PhieuMuonService(MongoDB.client);
    const userId = req.user._id;

    const phieuMuons = await phieuMuonService.getMyBorrowsWithDetails(userId);

    return res.send({
      message: "Lấy danh sách phiếu mượn thành công",
      data: phieuMuons,
      total: phieuMuons.length,
    });
  } catch (error) {
    console.error("Lỗi lấy phiếu mượn của tôi:", error);
    return next(new ApiError(500, "Không thể lấy danh sách phiếu mượn"));
  }
};

// Cập nhật lại trạng thái
exports.approve = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return next(new ApiError(400, "ID phiếu mượn không hợp lệ"));
  }

  try {
    const phieuMuonService = new PhieuMuonService(MongoDB.client);

    const updated = await phieuMuonService.approve(id, req.user._id);

    if (!updated) {
      return next(
        new ApiError(404, "Không tìm thấy phiếu mượn hoặc không thể duyệt")
      );
    }

    return res.send({
      message: "Duyệt phiếu mượn thành công",
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi duyệt phiếu:", error);
    return next(new ApiError(500, error.message || "Lỗi khi duyệt phiếu"));
  }
};

// Từ chối / Hủy phiếu (Chờ duyệt → Từ chối)
exports.reject = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return next(new ApiError(400, "ID phiếu mượn không hợp lệ"));
  }

  try {
    const phieuMuonService = new PhieuMuonService(MongoDB.client);

    const updated = await phieuMuonService.reject(id, req.user._id);

    if (!updated) {
      return next(
        new ApiError(404, "Không tìm thấy phiếu hoặc không thể từ chối")
      );
    }

    return res.send({
      message: "Đã từ chối phiếu mượn",
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi từ chối phiếu:", error);
    return next(new ApiError(500, error.message || "Lỗi khi từ chối phiếu"));
  }
};

exports.cancel = async (req, res, next) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return next(new ApiError(400, "ID phiếu mượn không hợp lệ"));
  }

  try {
    const phieuMuonService = new PhieuMuonService(MongoDB.client);

    const updated = await phieuMuonService.cancel(id, req.user._id);

    if (!updated) {
      return next(
        new ApiError(404, "Không tìm thấy phiếu hoặc không thể từ chối")
      );
    }

    return res.send({
      message: "Đã hủy phiếu mượn",
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi hủy phiếu:", error);
    return next(new ApiError(500, error.message || "Lỗi khi hủy phiếu"));
  }
};

// Xác nhận trả sách (Đang mượn → Đã trả)
exports.return = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  const { id } = req.params;
  const soNgayTraMuon = req.body.soNgayTraMuon;
  if (!ObjectId.isValid(id)) {
    return next(new ApiError(400, "ID phiếu mượn không hợp lệ"));
  }

  try {
    const phieuMuonService = new PhieuMuonService(MongoDB.client);

    const updated = await phieuMuonService.returnBook(
      id,
      req.user._id,
      soNgayTraMuon
    );

    if (!updated) {
      return next(
        new ApiError(404, "Không tìm thấy phiếu hoặc không thể xác nhận trả")
      );
    }

    return res.send({
      message: "Xác nhận trả sách thành công",
      data: updated,
    });
  } catch (error) {
    console.error("Lỗi xác nhận trả sách:", error);
    return next(new ApiError(500, error.message || "Lỗi khi trả sách"));
  }
};
