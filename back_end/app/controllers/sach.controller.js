const SachService = require("../services/sach.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

// CREATE
exports.create = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  try {
    // return res.send(JSON.stringify(req.body));
    const service = new SachService(MongoDB.client);
    console.log("payload.Anh trong controller:", req.files);
    const payload = {
      ...req.body,
      Anh: req.files?.Anh || null,
    };
    console.log("payload.Anh trong controller:", payload);

    const document = await service.create(payload);
    return res.status(201).send(document);
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

exports.findAll = async (req, res, next) => {
  try {
    const service = new SachService(MongoDB.client);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 15)
    );

    const ten = (req.query.keyword || req.query.ten || "").toString().trim();
    const trangthai = (req.query.status || req.query.trangthai || "")
      .toString()
      .trim();

    const theloai_id = req.query.theloai_id || "";
    const tacgia_id = req.query.tacgia_id || "";
    const nhaxuatban_id = req.query.nhaxuatban_id || "";

    const result = await service.getAll(
      page,
      limit,
      ten,
      trangthai,
      theloai_id,
      tacgia_id,
      nhaxuatban_id
    );

    return res.json(result);
  } catch (error) {
    console.error("findAll error:", error);
    return next(new ApiError(500, "Lỗi khi lấy danh sách sách"));
  }
};

// FIND ONE
exports.findOne = async (req, res, next) => {
  try {
    const service = new SachService(MongoDB.client);
    const document = await service.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi lấy sách với id=${req.params.id}`));
  }
};

// UPDATE
exports.update = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  if (Object.keys(req.body).length === 0) {
    return next(new ApiError(400, "Dữ liệu cập nhật không được để trống"));
  }

  try {
    const service = new SachService(MongoDB.client);
    const payload = {
      ...req.body,
      Anh: req.files?.Anh || null,
    };

    const document = await service.update(req.params.id, payload);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

// DELETE
exports.delete = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  try {
    const service = new SachService(MongoDB.client);
    const document = await service.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

// DELETE ALL
exports.deleteAll = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  try {
    const service = new SachService(MongoDB.client);
    const deletedCount = await service.deleteAll();
    return res.send({ message: `${deletedCount} sách đã được xóa thành công` });
  } catch (error) {
    return next(new ApiError(500, "Có lỗi xảy ra khi xóa tất cả sách"));
  }
};

exports.toggleStatus = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  try {
    const sachService = new SachService(MongoDB.client);
    const document = await sachService.toggleStatus(req.params.id);

    if (!document) {
      return next(new ApiError(404, "Không tìm thấy sách"));
    }

    return res.send({
      message: "Cập nhật trạng thái thành công",
      trangThai: document.TrangThai,
    });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};
