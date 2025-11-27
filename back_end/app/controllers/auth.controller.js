const AuthService = require("../services/auth.service");
const MongoDB = require("../utils/mongodb.util");
const ApiError = require("../api-error");

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

    req.session.users.docgia = {
      _id: user._id.toString(),
      Username: user.Username,
      HoTen: user.HoTen,
      DiaChi: user.DiaChi,
      GioiTinh: user.GioiTinh,
      SoDienThoai: user.SoDienThoai,
      Anh: user.Anh,
      type: "docgia",
    };

    return res.send({
      message: "Đăng nhập thành công",
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

    req.session.users.admin = {
      _id: user._id.toString(),
      Username: user.Username,
      HoTen: user.HoTen,
      DiaChi: user.DiaChi,
      GioiTinh: user.GioiTinh,
      SoDienThoai: user.SoDienThoai,
      Anh: user.Anh,
      type: "admin",
    };

    return res.send({
      message: "Đăng nhập admin thành công",
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
    return res.send();
  }

  try {
    const referer = (req.headers.referer || "").toLowerCase();

    if (referer.includes("3001")) {
      delete req.session.users?.admin;
      console.log("Admin đã đăng xuất");
      console.log(req.session.users);
    } else if (referer.includes("3002")) {
      delete req.session.users?.docgia;
      console.log("Độc giả đã đăng xuất");
      console.log(req.session.users);
    }

    return res.send({
      message: "Đăng xuất thành công",
      remaining: {
        admin: !!req.session.users?.admin,
        docgia: !!req.session.users?.docgia,
      },
    });
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, error));
  }
};

exports.me = (req, res, next) => {
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

    // Cập nhật lại session
    req.session.users.docgia = {
      ...req.user,
      Username: updatedUser.Username,
      HoTen: updatedUser.HoTen,
      SoDienThoai: updatedUser.SoDienThoai,
      DiaChi: updatedUser.DiaChi,
      GioiTinh: updatedUser.GioiTinh,
      Anh: updatedUser.Anh,
      type: "docgia",
    };

    return res.send(updatedUser);
  } catch (error) {
    return next(new ApiError(400, error.message));
  }
};
