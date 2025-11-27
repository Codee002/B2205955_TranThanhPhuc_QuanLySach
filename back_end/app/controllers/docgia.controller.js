const DocGiaService = require("../services/docgia.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

exports.getAll = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const result = await docGiaService.getAll(req.query);
    res.send(result);
  } catch (err) {
    next(new ApiError(500, err.message || "Lỗi khi lấy danh sách độc giả"));
  }
};

exports.get = async (req, res, next) => {
  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    const docGia = await docGiaService.get(req.params.id);
    res.send(docGia);
  } catch (err) {
    next(new ApiError(400, err.message || "Không tìm thấy độc giả"));
  }
};

exports.toggleStatus = async (req, res, next) => {
  if (req.user.type != "admin") {
    return next(
      new ApiError(403, `Bạn không có quyền thực hiện hành động này!`)
    );
  }

  try {
    const docGiaService = new DocGiaService(MongoDB.client);
    await docGiaService.toggleStatus(req.params.id, req.body);
    res.send({});
  } catch (err) {
    next(new ApiError(400, err.message || "Lỗi khi cập nhật độc giả"));
  }
};
