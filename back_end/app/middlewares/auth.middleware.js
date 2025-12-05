const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

exports.generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

exports.verifyToken = (req, res, next) => {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Vui lòng đăng nhập"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log(req.user);
    next();
  } catch (error) {
    return next(new ApiError(401, "Token không hợp lệ hoặc đã hết hạn"));
  }
};

exports.authorize = (allowedTypes = []) => {
  return (req, res, next) => {
    if (!req.user) return next(new ApiError(401, "Chưa đăng nhập"));
    if (!allowedTypes.includes(req.user.type)) {
      return next(new ApiError(403, "Không có quyền truy cập"));
    }
    next();
  };
};
