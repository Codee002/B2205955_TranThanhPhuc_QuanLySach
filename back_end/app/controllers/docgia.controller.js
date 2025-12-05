const DocGiaService = require("../services/docgia.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const AuthService = require("../services/auth.service");
const { generateToken } = require("../middlewares/auth.middleware");

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

exports.me = (req, res, next) => {
  console.log("MEEE");
  if (req.user) {
    return res.send({ user: req.user });
  }
  return next(new ApiError(401, "Chưa đăng nhập"));
};

exports.updateProfile = async (req, res, next) => {
  if (!req.user) return next(new ApiError(401, "Chưa đăng nhập"));

  try {
    const authService = new AuthService(MongoDB.client);
    const payload = {
      ...req.body,
      Anh: req.files?.Anh || null,
    };

    const updatedUser = await authService.updateDocGiaProfile(
      req.user._id,
      payload
    );

    const token = generateToken({
      _id: updatedUser._id.toString(),
      Username: updatedUser.Username,
      HoTen: updatedUser.HoTen,
      DiaChi: updatedUser.DiaChi,
      GioiTinh: updatedUser.GioiTinh,
      SoDienThoai: updatedUser.SoDienThoai,
      Anh: updatedUser.Anh,
      type: "docgia",
    });

    return res.send({ token, updatedUser });
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
