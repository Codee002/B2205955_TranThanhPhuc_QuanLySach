<template>
  <main class="app-main p-0" style="height: 100%">
    <div class="container" style="max-width: 800px">
      <h2 class="text-center fw-bolder mt-4 mb-4">Chỉnh sửa sách</h2>

      <Form
        v-if="currentBook._id"
        @submit="onSubmit"
        :validation-schema="schema"
        :initial-values="initialValues"
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
              <option value="on">Bật (Hiển thị)</option>
              <option value="off">Tắt (Ẩn)</option>
            </Field>
            <ErrorMessage name="TrangThai" class="invalid-feedback" />
          </div>

          <!-- Ảnh bìa hiện tại -->
          <div class="col-12 mb-3">
            <label class="form-label">Ảnh bìa hiện tại</label>
            <div class="text-center">
              <img
                v-if="currentBook.Anh"
                :src="`http://localhost:3000${currentBook.Anh}`"
                alt="Ảnh hiện tại"
                style="
                  max-width: 300px;
                  max-height: 400px;
                  border-radius: 8px;
                  object-fit: cover;
                "
              />
              <p v-else class="text-muted">Chưa có ảnh</p>
            </div>
          </div>

          <!-- Đổi ảnh mới (tùy chọn) -->
          <div class="col-12 mb-4">
            <label class="form-label">Đổi ảnh bìa (không bắt buộc)</label>
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
              <p class="text-success fw-bold">Preview ảnh mới:</p>
              <img
                :src="previewUrl"
                alt="Preview mới"
                style="max-width: 300px; max-height: 400px; border-radius: 8px"
              />
            </div>
          </div>
        </div>

        <div class="text-end">
          <router-link :to="{ name: 'book' }">
            <button type="button" class="btn btn-secondary me-2">Hủy</button>
          </router-link>
          <button
            type="submit"
            class="btn btn-primary px-5"
            :disabled="isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            Cập nhật
          </button>
        </div>
      </Form>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";

import SachService from "@/services/book.service";
import TacGiaService from "@/services/author.service";
import TheLoaiService from "@/services/category.service";
import NhaXuatBanService from "@/services/producer.service";

const route = useRoute();
const router = useRouter();
const bookId = route.params.id;

const currentBook = ref({});
const authors = ref([]);
const categories = ref([]);
const publishers = ref([]);

const previewUrl = ref(null);
const selectedFile = ref(null);
const photoError = ref(null);
const currentYear = new Date().getFullYear();

const schema = yup.object({
  TenSach: yup.string().required("Tên sách là bắt buộc"),
  MoTa: yup.string().required("Mô tả là bắt buộc"),
  DonGia: yup
    .number("Đơn giá là số nguyên")
    .required("Đơn giá là bắt buộc")
    .min(1, "Đơn giá phải lớn hơn 0"),
  SoLuong: yup
    .number("Số lượng là số nguyên")
    .required("Số lượng là bắt buộc")
    .min(1, "Số lượng phải lớn hơn 0"),
  TacGia_id: yup.string().required("Vui lòng chọn tác giả"),
  TheLoai_id: yup.string().required("Vui lòng chọn thể loại"),
  NhaXuatBan_id: yup.string().required("Vui lòng chọn nhà xuất bản"),
  NamXuatBan: yup
    .number()
    .required("Năm xuất bản là bắt buộc")
    .max(currentYear, `Không được lớn hơn ${currentYear}`),
  TrangThai: yup
    .string()
    .required("Vui lòng chọn trạng thái")
    .oneOf(["on", "off"]),
});

const initialValues = computed(() => ({
  TenSach: currentBook.value.TenSach || "",
  MoTa: currentBook.value.MoTa || "",
  DonGia: currentBook.value.DonGia || "",
  SoLuong: currentBook.value.SoLuong || "",
  TacGia_id: currentBook.value.TacGia_id || "",
  TheLoai_id: currentBook.value.TheLoai_id || "",
  NhaXuatBan_id: currentBook.value.NhaXuatBan_id || "",
  NamXuatBan: currentBook.value.NamXuatBan || "",
  TrangThai: currentBook.value.TrangThai || "on",
}));

const loadData = async () => {
  try {
    currentBook.value = await SachService.get(bookId);
    authors.value = await TacGiaService.getAll();
    categories.value = await TheLoaiService.getAll();
    publishers.value = await NhaXuatBanService.getAll();

    if (!currentBook.value) throw new Error("Không tìm thấy sách");

    console.log(initialValues.value);
  } catch (err) {
    Swal.fire("Lỗi", err.message || "Không tải được dữ liệu", "error");
    router.push({ name: "book" });
  }
};

const onFileChange = (e) => {
  const file = e.target.files[0];
  photoError.value = null;
  selectedFile.value = null;
  previewUrl.value = null;

  if (!file) return;

  if (!file.type.startsWith("image/")) {
    photoError.value = "Chỉ chấp nhận file ảnh";
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    photoError.value = "Ảnh không được lớn hơn 10MB";
    return;
  }

  selectedFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
};

const onSubmit = async (values) => {
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

    if (selectedFile.value != null) {
      formData.append("Anh", selectedFile.value);
    }

    await SachService.update(bookId, formData);

    await Swal.fire({
      title: "Cập nhật thành công!",
      icon: "success",
      timer: 1500,
      theme: "dark",
    });

    router.push({ name: "book" });
  } catch (err) {
    await Swal.fire({
      title: "Lỗi",
      text: err.response?.data?.message || "Có lỗi xảy ra",
      icon: "error",
      theme: "dark",
    });
  }
};

onMounted(async () => {
  await loadData();
});
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