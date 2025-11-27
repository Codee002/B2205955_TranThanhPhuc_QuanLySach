const ApiError = require("../api-error");
const TheLoaiService = require("../services/theloai.service");
const MongoDB = require("../utils/mongodb.util");

exports.create = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  if (!req.body?.Ten) {
    return next(new ApiError(400, "Tên thể loại không được để trống"));
  }

  try {
    const service = new TheLoaiService(MongoDB.client);
    const document = await service.create(req.body);
    return res.send(document);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.findAll = async (req, res, next) => {
  let documents = [];
  try {
    const service = new TheLoaiService(MongoDB.client);
    const { name } = req.query;
    if (name) {
      documents = await service.findByName(name);
    } else {
      documents = await service.find({});
    }
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi lấy danh sách thể loại"));
  }
  return res.send(documents);
};

exports.findOne = async (req, res, next) => {
  try {
    const service = new TheLoaiService(MongoDB.client);
    const document = await service.findById(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thể loại"));
    }
    return res.send(document);
  } catch (error) {
    return next(new ApiError(500, `Lỗi khi lấy thể loại id=${req.params.id}`));
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
    const service = new TheLoaiService(MongoDB.client);
    const document = await service.update(req.params.id, req.body);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thể loại"));
    }
    return res.send({ message: "Cập nhật thể loại thành công" });
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
    const service = new TheLoaiService(MongoDB.client);
    const document = await service.delete(req.params.id);
    if (!document) {
      return next(new ApiError(404, "Không tìm thấy thể loại"));
    }
    return res.send({ message: "Xóa thể loại thành công" });
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
    const service = new TheLoaiService(MongoDB.client);
    const deletedCount = await service.deleteAll();
    return res.send({
      message: `${deletedCount} thể loại đã bị xóa`,
    });
  } catch (error) {
    return next(new ApiError(500, "Lỗi khi xóa tất cả thể loại"));
  }
};
