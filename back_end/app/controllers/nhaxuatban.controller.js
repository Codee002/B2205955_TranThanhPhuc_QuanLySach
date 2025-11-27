const ApiError = require("../api-error");
const NhaXuatBanService = require("../services/nhaxuatban.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  if (!req.body?.TenNXB || !req.body?.DiaChi) {
    return next(new ApiError(400, `Vui lòng nhập đầy đủ thông tin ${req}`));
  }

  try {
    const service = new NhaXuatBanService(MongoDB.client);
    const document = await service.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const service = new NhaXuatBanService(MongoDB.client);
    const { name } = req.query;
    if (name) {
      documents = await service.findByName(name);
    } else {
      documents = await service.find({});
    }
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
  return res.send(documents);
};

exports.findOne = async (req, res, next) => {
  try {
    const service = new NhaXuatBanService(MongoDB.client);
    const document = await service.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

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
    const service = new NhaXuatBanService(MongoDB.client);
    const document = await service.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
    }
    return res.send({ message: "Cập nhật nhà xuất bản thành công" });
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.delete = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  try {
    const service = new NhaXuatBanService(MongoDB.client);
    const document = await service.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy nhà xuất bản"));
    }
    return res.send({ message: "Xóa nhà xuất bản thành công" });
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
};

exports.deleteAll = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  try {
    const service = new NhaXuatBanService(MongoDB.client);
    const deletedCount = await service.deleteAll();
    return res.send({
      message: `${deletedCount} nhà xuất bản đã bị xóa`,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa tất cả nhà xuất bản"));
  }
};
