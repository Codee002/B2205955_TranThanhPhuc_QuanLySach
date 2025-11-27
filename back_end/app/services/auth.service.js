// services/auth.service.js
const { ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

class AuthService {
  constructor(client) {
    this.DocGia = client.db().collection("docgias");
    this.Admin = client.db().collection("nhanviens");
  }

  extractId(id) {
    return ObjectId.isValid(id) ? new ObjectId(id) : null;
  }

  async registerDocGia(data) {
    const {
      username,
      password,
      hoTen,
      soDienThoai,
      diaChi,
      gioiTinh,
      trangThai = "active",
    } = data;

    if (
      !username ||
      !password ||
      !hoTen ||
      !soDienThoai ||
      !diaChi ||
      !gioiTinh
    ) {
      throw new Error("Thiếu thông tin bắt buộc");
    }

    const exist = await this.DocGia.findOne({ Username: username });
    if (exist) throw new Error("Tên đăng nhập đã tồn tại");

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const result = await this.DocGia.insertOne({
      Username: username,
      Password: hashed,
      HoTen: hoTen,
      SoDienThoai: soDienThoai,
      DiaChi: diaChi,
      GioiTinh: gioiTinh,
      TrangThai: trangThai,
      NgayTao: new Date(),
    });

    const user = await this.DocGia.findOne(
      { _id: result.insertedId },
      { projection: { Password: 0 } } // không trả password
    );

    return { ...user, type: "docgia" };
  }

  // ĐĂNG NHẬP ĐỘC GIẢ
  async loginDocGia(username, password) {
    const user = await this.DocGia.findOne({ Username: username });
    if (!user) throw new Error("Sai tên đăng nhập hoặc mật khẩu");

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) throw new Error("Sai tên đăng nhập hoặc mật khẩu");

    if (user.TrangThai == "inactive")
      throw new Error("Tài khoản của bạn đã bị khóa");
    delete user.Password;
    return { ...user, type: "docgia" };
  }

  // ĐĂNG NHẬP ADMIN
  async loginAdmin(username, password) {
    const user = await this.Admin.findOne({ Username: username });
    if (!user) throw new Error("Sai tên đăng nhập hoặc mật khẩu");

    const isMatch = await bcrypt.compare(password, user.Password);
    if (!isMatch) throw new Error("Sai tên đăng nhập hoặc mật khẩu");

    delete user.Password;
    return { ...user, type: "admin" };
  }

  async getUserById(id, type = "docgia") {
    const objectId = this.extractId(id);
    if (!objectId) throw new Error("ID không hợp lệ");

    const collection = type === "admin" ? this.Admin : this.DocGia;
    const user = await collection.findOne(
      { _id: objectId },
      { projection: { Password: 0 } }
    );

    if (!user) throw new Error("Không tìm thấy người dùng");
    return { ...user, type };
  }

  async updateDocGiaProfile(userId, payload) {
    const filter = {
      _id: ObjectId.isValid(userId) ? new ObjectId(userId) : null,
    };
    if (!filter._id) throw new Error("ID người dùng không hợp lệ");

    const allowedFields = ["HoTen", "SoDienThoai", "DiaChi", "GioiTinh", "Anh"];
    const updateData = {};

    // Xử lý các field text bình thường
    allowedFields.forEach((field) => {
      if (
        payload[field] !== undefined &&
        payload[field] !== null &&
        payload[field] !== ""
      ) {
        updateData[field] = payload[field].toString().trim();
      }
    });

    let newImagePath = null;
    // === XỬ LÝ ẢNH ĐẠI DIỆN (nếu có upload) ===
    if (payload.Anh && payload.Anh.name) {
      const file = payload.Anh;
      const fileExt = path
        .extname(file.originalname || file.name)
        .toLowerCase();
      const allowed = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

      if (!allowed.includes(fileExt)) {
        throw new Error("Chỉ chấp nhận file ảnh JPG, PNG, GIF, WebP");
      }

      // Tạo tên file duy nhất
      const fileName = `avatar-${userId}-${Date.now()}${fileExt}`;
      const uploadDir = path.join(__dirname, "../../public/uploads/avatars");

      // Tạo thư mục nếu chưa có
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Di chuyển file vào thư mục
      await file.mv(path.join(uploadDir, fileName));
      newImagePath = `/uploads/avatars/${fileName}`;

      // === XÓA ẢNH CŨ (nếu có) ===
      const currentUser = await this.DocGia.findOne(filter);
      if (currentUser?.Anh && currentUser.Anh.startsWith("/uploads/avatars/")) {
        const oldPath = path.join(__dirname, "../../public", currentUser.Anh);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
            console.log("Đã xóa ảnh đại diện cũ:", oldPath);
          } catch (err) {
            console.warn("Không thể xóa ảnh cũ:", oldPath);
          }
        }
      }

      // Gán ảnh mới vào updateData
      updateData.Anh = newImagePath;
    }

    // === XỬ LÝ KHI NGƯỜI DÙNG BẤM "XÓA ẢNH"  ===
    else if (payload.removeAvatar === "true") {
      const currentUser = await this.DocGia.findOne(filter);
      if (currentUser?.Anh && currentUser.Anh.startsWith("/uploads/avatars/")) {
        const oldPath = path.join(__dirname, "../../public", currentUser.Anh);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
            console.log("Đã xóa ảnh đại diện theo yêu cầu người dùng");
          } catch (err) {
            console.warn("Không thể xóa ảnh:", oldPath);
          }
        }
      }
      updateData.Anh = null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("Không có thông tin nào được thay đổi");
    }

    const result = await this.DocGia.findOneAndUpdate(
      filter,
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!result) throw new Error("Không tìm thấy người dùng");

    return result;
  }
}

module.exports = AuthService;
