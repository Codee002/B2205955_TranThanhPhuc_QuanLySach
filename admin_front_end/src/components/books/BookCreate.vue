<template>
  <main class="app-main p-0" style="height: 100%">
    <div class="container" style="max-width: 800px">
      <h2 class="text-center fw-bolder mt-4 mb-4">Thêm sách mới</h2>

      <Form
        @submit="onSubmit"
        :validation-schema="schema"
        v-slot="{ errors, isSubmitting }"
      >
        <div class="row">
          <!-- Tên sách -->
          <div class="col-12 mb-3">
            <label class="form-label"
              >Tên sách <span class="text-danger">*</span></label
            >
            <Field
              name="TenSach"
              type="text"
              class="form-control"
              placeholder="Nhập tên sách"
              :class="{ 'is-invalid': errors.TenSach }"
            />
            <ErrorMessage name="TenSach" class="invalid-feedback" />
          </div>

          <!-- Mô tả -->
          <div class="col-12 mb-3">
            <label class="form-label"
              >Mô tả <span class="text-danger">*</span></label
            >
            <Field
              as="textarea"
              name="MoTa"
              rows="4"
              class="form-control"
              placeholder="Mô tả ngắn về sách"
              :class="{ 'is-invalid': errors.MoTa }"
            />
            <ErrorMessage name="MoTa" class="invalid-feedback" />
          </div>

          <!-- Đơn giá & Số lượng -->
          <div class="col-md-6 mb-3">
            <label class="form-label"
              >Đơn giá (VNĐ) <span class="text-danger">*</span></label
            >
            <Field
              name="DonGia"
              type="number"
              class="form-control"
              placeholder="100000"
              :class="{ 'is-invalid': errors.DonGia }"
            />
            <ErrorMessage name="DonGia" class="invalid-feedback" />
          </div>

          <div class="col-md-6 mb-3">
            <label class="form-label"
              >Số lượng <span class="text-danger">*</span></label
            >
            <Field
              name="SoLuong"
              type="number"
              class="form-control"
              placeholder="50"
              :class="{ 'is-invalid': errors.SoLuong }"
            />
            <ErrorMessage name="SoLuong" class="invalid-feedback" />
          </div>

          <!-- Tác giả -->
          <div class="col-md-4 mb-3">
            <label class="form-label"
              >Tác giả <span class="text-danger">*</span></label
            >
            <Field
              as="select"
              name="TacGia_id"
              class="form-select"
              :class="{ 'is-invalid': errors.TacGia_id }"
            >
              <option value="">-- Chọn tác giả --</option>
              <option v-for="tg in authors" :key="tg._id" :value="tg._id">
                {{ tg.HoTen }}
              </option>
            </Field>
            <ErrorMessage name="TacGia_id" class="invalid-feedback" />
          </div>

          <!-- Thể loại -->
          <div class="col-md-4 mb-3">
            <label class="form-label"
              >Thể loại <span class="text-danger">*</span></label
            >
            <Field
              as="select"
              name="TheLoai_id"
              class="form-select"
              :class="{ 'is-invalid': errors.TheLoai_id }"
            >
              <option value="">-- Chọn thể loại --</option>
              <option v-for="tl in categories" :key="tl._id" :value="tl._id">
                {{ tl.Ten }}
              </option>
            </Field>
            <ErrorMessage name="TheLoai_id" class="invalid-feedback" />
          </div>

          <!-- Nhà xuất bản -->
          <div class="col-md-4 mb-3">
            <label class="form-label"
              >Nhà xuất bản <span class="text-danger">*</span></label
            >
            <Field
              as="select"
              name="NhaXuatBan_id"
              class="form-select"
              :class="{ 'is-invalid': errors.NhaXuatBan_id }"
            >
              <option value="">-- Chọn NXB --</option>
              <option v-for="nxb in publishers" :key="nxb._id" :value="nxb._id">
                {{ nxb.TenNXB }}
              </option>
            </Field>
            <ErrorMessage name="NhaXuatBan_id" class="invalid-feedback" />
          </div>

          <!-- Năm xuất bản -->
          <div class="col-md-6 mb-3">
            <label class="form-label"
              >Năm xuất bản <span class="text-danger">*</span></label
            >
            <Field
              name="NamXuatBan"
              type="number"
              class="form-control"
              placeholder="2025"
              min="1900"
              :max="currentYear"
              :class="{ 'is-invalid': errors.NamXuatBan }"
            />
            <ErrorMessage name="NamXuatBan" class="invalid-feedback" />
          </div>

          <!-- Trạng thái -->
          <div class="col-md-6 mb-3">
            <label class="form-label"
              >Trạng thái <span class="text-danger">*</span></label
            >
            <Field
              as="select"
              name="TrangThai"
              class="form-select"
              :class="{ 'is-invalid': errors.TrangThai }"
            >
              <option value="">-- Chọn trạng thái --</option>
              <option value="on">Bật (Hiển thị)</option>
              <option value="off">Tắt (Ẩn)</option>
            </Field>
            <ErrorMessage name="TrangThai" class="invalid-feedback" />
          </div>

          <!-- Ảnh bìa -->
          <div class="col-12 mb-4">
            <label class="form-label"
              >Ảnh bìa sách <span class="text-danger">*</span></label
            >
            <input
              type="file"
              accept="image/*"
              class="form-control"
              :class="{ 'is-invalid': photoError }"
              @change="onFileChange"
              ref="fileInput"
            />
            <div v-if="photoError" class="invalid-feedback d-block">
              {{ photoError }}
            </div>
            <div v-if="previewUrl" class="mt-3 text-center">
              <img
                :src="previewUrl"
                alt="Preview"
                style="max-width: 300px; max-height: 400px; border-radius: 8px"
              />
            </div>
          </div>
        </div>

        <!-- Nút submit -->
        <div class="text-end">
          <button
            type="submit"
            class="btn btn-primary px-5"
            :disabled="isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            Thêm sách
          </button>
        </div>
      </Form>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import AuthorService from "@/services/author.service";
import CategoryService from "@/services/category.service";
import ProducerService from "@/services/producer.service";
import BookService from "@/services/book.service";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const router = useRouter();
const authors = ref([]);
const categories = ref([]);
const publishers = ref([]);
const previewUrl = ref(null);
const selectedFile = ref(null);
const photoError = ref(null);

const currentYear = new Date().getFullYear();

// Validation schema
const schema = yup.object({
  TenSach: yup.string().required("Tên sách là bắt buộc"),
  MoTa: yup.string().required("Mô tả là bắt buộc"),
  DonGia: yup
    .number()
    .required("Đơn giá là bắt buộc")
    .min(1, "Đơn giá phải lớn hơn 0"),
  SoLuong: yup
    .number()
    .required("Số lượng là bắt buộc")
    .min(0, "Số lượng không được âm"),
  TacGia_id: yup.string().required("Vui lòng chọn tác giả"),
  TheLoai_id: yup.string().required("Vui lòng chọn thể loại"),
  NhaXuatBan_id: yup.string().required("Vui lòng chọn nhà xuất bản"),
  NamXuatBan: yup
    .number()
    .required("Năm xuất bản là bắt buộc")
    .max(currentYear, `Năm xuất bản không được lớn hơn ${currentYear}`),
  TrangThai: yup
    .string()
    .required("Vui lòng chọn trạng thái")
    .oneOf(["on", "off"]),
});

// Load dữ liệu khi vào trang
onMounted(async () => {
  try {
    authors.value = await AuthorService.getAll();
    categories.value = await CategoryService.getAll();
    publishers.value = await ProducerService.getAll();
  } catch (err) {
    Swal.fire("Lỗi", "Không tải được dữ liệu phụ", "error");
  }
});

// Xử lý chọn file ảnh
const onFileChange = (e) => {
  const file = e.target.files[0];
  photoError.value = null; // xóa lỗi cũ

  if (!file) {
    selectedFile.value = null;
    previewUrl.value = null;
    photoError.value = "Vui lòng chọn ảnh bìa";
    return;
  }

  // Kiểm tra loại file
  if (!file.type.startsWith("image/")) {
    photoError.value = "File phải là định dạng ảnh";
    selectedFile.value = null;
    previewUrl.value = null;
    return;
  }

  // Kiểm tra kích thước (tùy chọn, ví dụ < 10MB)
  if (file.size > 10 * 1024 * 1024) {
    photoError.value = "Ảnh không được lớn hơn 10MB";
    selectedFile.value = null;
    previewUrl.value = null;
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

// Submit form
const onSubmit = async (values) => {
  if (photoError.value) return;

  if (!selectedFile.value) {
    photoError.value = "Vui lòng chọn ảnh bìa";
    return;
  }

  try {
    const formData = new FormData();
    formData.append("TenSach", values.TenSach);
    formData.append("MoTa", values.MoTa);
    formData.append("DonGia", values.DonGia);
    formData.append("SoLuong", values.SoLuong);
    formData.append("TacGia_id", values.TacGia_id);
    formData.append("TheLoai_id", values.TheLoai_id);
    formData.append("NhaXuatBan_id", values.NhaXuatBan_id);
    formData.append("NamXuatBan", values.NamXuatBan);
    formData.append("TrangThai", values.TrangThai);
    formData.append("Anh", selectedFile.value);

    console.log("Dữ liệu gửi đi: ");
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    const res = await BookService.create(formData);

    await Swal.fire({
      title: "Thêm sách thành công!",
      icon: "success",
      timer: 1500,
    });
    console.log(res);
    router.push({ name: "book" });
  } catch (err) {
    const msg = err.response?.data?.message || "Có lỗi xảy ra khi thêm sách";
    Swal.fire("Thất bại", msg, "error");
  }
};
</script>

<style scoped>
.form-control,
.form-select {
  height: 3rem;
}
textarea.form-control {
  height: auto;
}
</style>