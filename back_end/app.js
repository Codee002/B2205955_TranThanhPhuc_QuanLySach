const express = require("express");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const tacgiaRouter = require("./app/routes/tacgia.route");
const theloaiRouter = require("./app/routes/theloai.route");
const nhaxuatbanRouter = require("./app/routes/nhaxuatban.route");
const sachRouter = require("./app/routes/sach.route");
const phieumuonRouter = require("./app/routes/phieumuon.route");
const docgiaRouter = require("./app/routes/docgia.route");
const authRouter = require("./app/routes/auth.route");

const jwt = require("jsonwebtoken");
const { verifyToken, authorize } = require("./app/middlewares/auth.middleware");
const ApiError = require("./app/api-error");
require("dotenv").config();
const app = express();

app.use(
  cors({
    origin: [process.env.ORIGIN_ADMIN, process.env.ORIGIN_USER],
    credentials: true,
  })
);

app.use(
  fileUpload({
    limits: { fileSize: 10 * 1024 * 1024 },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Đọc ảnh
app.use("/uploads", express.static("public/uploads"));

app.use("/api/auth", authRouter);

// Kiểm tra đăng nhập
app.use(verifyToken);

// Route
app.use("/api/tacgia", authorize(["admin", "docgia"]), tacgiaRouter);
app.use("/api/nhaxuatban", authorize(["admin", "docgia"]), nhaxuatbanRouter);
app.use("/api/theloai", authorize(["admin", "docgia"]), theloaiRouter);
app.use("/api/sach", authorize(["admin", "docgia"]), sachRouter);
app.use("/api/phieumuon", authorize(["admin", "docgia"]), phieumuonRouter);
app.use("/api/docgia", authorize(["admin", "docgia"]), docgiaRouter);

// handle 404 respone
app.use((req, res, next) => {
  return next(new ApiError(404, "Resource not found"));
});

app.use((error, req, res, next) => {
  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;
