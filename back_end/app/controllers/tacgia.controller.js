const ApiError = require("../api-error");
const TacGiaService = require("../services/tacgia.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  if (!req.body?.HoTen || !req.body?.DiaChi) {
    return next(new ApiError(400, "Vui lòng nhập đẩy đủ thông tin"));
  }

  try {
    const tacgiaService = new TacGiaService(MongoDB.client);
    const document = await tacgiaService.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const tacgiaService = new TacGiaService(MongoDB.client);
    const { name } = req.query;
    if (name) {
      documents = await tacgiaService.findByName(name);
    } else {
      documents = await tacgiaService.find({});
    }
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi lấy danh sách tác giả"));
  }
  return res.send(documents);
};

exports.findOne = async (req, res, next) => {
  try {
    const tacgiaService = new TacGiaService(MongoDB.client);
    const document = await tacgiaService.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy tác giả"));
    }
    return res.send(document);
  } catch (error) {
    return next(
      new ApiError(500, `Lỗi khi lấy tác giả với id=${req.params.id}`)
    );
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
    const tacgiaService = new TacGiaService(MongoDB.client);
    const document = await tacgiaService.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy tác giả"));
    }
    return res.send({ message: "Cập nhật tác giả thành công" });
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
    const tacgiaService = new TacGiaService(MongoDB.client);
    const document = await tacgiaService.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy tác giả"));
    }
    return res.send({ message: "Xóa tác giả thành công" });
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
    const tacgiaService = new TacGiaService(MongoDB.client);
    const deletedCount = await tacgiaService.deleteAll();
    return res.send({
      message: `${deletedCount} tác giả đã được xóa thành công`,
    });
  } catch (error) {
    return next(new ApiError(500, "Đã xảy ra lỗi khi xóa tất cả tác giả"));
  }
};
