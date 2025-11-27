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

const session = require("express-session");
const cookieParser = require("cookie-parser");
const ApiError = require("./app/api-error");
require("dotenv").config();
const app = express();

app.use(
  cors({
    origin: [process.env.ORIGIN_ADMIN, process.env.ORIGIN_USER],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

app.use((req, res, next) => {
  req.session.users = req.session.users || {};
  const referer = (req.headers.referer || "").toLowerCase();
  if (referer.includes(process.env.PORT_ADMIN)) {
    req.user = req.session.users.admin || null;
  } else if (referer.includes(process.env.PORT_USER)) {
    req.user = req.session.users.docgia || null;
  } else {
    req.user = req.session.users.admin || req.session.users.docgia || null;
  }

  console.log("Current user:", req.user?.HoTen, req.user?.type);
  console.log("Data user:", req.user);

  next();
});

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

// Route
app.use("/api/tacgia", tacgiaRouter);
app.use("/api/nhaxuatban", nhaxuatbanRouter);
app.use("/api/theloai", theloaiRouter);
app.use("/api/sach", sachRouter);
app.use("/api/phieumuon", phieumuonRouter);
app.use("/api/docgia", docgiaRouter);
app.use("/api/auth", authRouter);

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
