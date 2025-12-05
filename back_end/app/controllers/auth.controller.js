const AuthService = require("../services/auth.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");
const { generateToken } = require("../middlewares/auth.middleware");

exports.register = async (req, res, next) => {
  try {
    const authService = new AuthService(MongoDB.client);

    const user = await authService.registerDocGia(req.body);

    return res.status(201).send({
      message: "Đăng ký thành công",
      user: { hoTen: user.HoTen, username: user.Username },
    });
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};

exports.loginDocGia = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const authService = new AuthService(MongoDB.client);
    const user = await authService.loginDocGia(username, password);
    console.log(user);

    const token = generateToken({
      _id: user._id.toString(),
      Username: user.Username,
      HoTen: user.HoTen,
      DiaChi: user.DiaChi,
      GioiTinh: user.GioiTinh,
      SoDienThoai: user.SoDienThoai,
      Anh: user.Anh,
      type: "docgia",
    });

    return res.send({
      message: "Đăng nhập thành công",
      token,
      user: {
        _id: user._id.toString(),
        Username: user.Username,
        HoTen: user.HoTen,
        DiaChi: user.DiaChi,
        GioiTinh: user.GioiTinh,
        SoDienThoai: user.SoDienThoai,
        Anh: user.Anh,
        type: "docgia",
      },
    });
  } catch (error) {
    return next(new ApiError(401, error.message));
  }
};

exports.loginAdmin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const authService = new AuthService(MongoDB.client);
    const user = await authService.loginAdmin(username, password);

    const token = generateToken({
      _id: user._id.toString(),
      Username: user.Username,
      HoTen: user.HoTen,
      DiaChi: user.DiaChi,
      GioiTinh: user.GioiTinh,
      SoDienThoai: user.SoDienThoai,
      Anh: user.Anh,
      type: "admin",
    });

    return res.send({
      message: "Đăng nhập admin thành công",
      token,
      user: {
        _id: user._id.toString(),
        Username: user.Username,
        HoTen: user.HoTen,
        DiaChi: user.DiaChi,
        GioiTinh: user.GioiTinh,
        SoDienThoai: user.SoDienThoai,
        Anh: user.Anh,
        type: "admin",
      },
    });
  } catch (error) {
    return next(new ApiError(401, error.message));
  }
};

exports.logout = (req, res, next) => {
  if (!req.user) {
    console.log("ME");
    console.log(req.user);
    return res.send();
  }

  return res.send({
    message: "Đăng xuất thành công",
  });
};
