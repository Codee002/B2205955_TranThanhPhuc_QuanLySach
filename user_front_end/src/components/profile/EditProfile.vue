<template>
  <div class="py-5">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10 col-xl-9">
          <div class="card shadow-lg border-0 rounded-4 overflow-hidden">
            <!-- Header -->
            <div
              class="card-header bg-gradient-primary text-white text-center py-4"
            >
              <h3 class="mb-0 fw-bold">Thông tin cá nhân</h3>
            </div>

            <div class="card-body p-5">
              <Form
                @submit="onSubmit"
                :validation-schema="schema"
                :initial-values="initialValues"
                v-slot="{ errors, isSubmitting }"
                v-if="currentUser.HoTen"
              >
                <!-- Layout ngang: ảnh trái - form phải -->
                <div class="row g-5 align-items-start">
                  <!-- Cột trái: Ảnh đại diện + Upload -->
                  <div class="col-lg-4 text-center">
                    <div class="position-relative d-inline-block">
                      <div class="avatar-wrapper mx-auto">
                        <!-- Ưu tiên: ảnh từ backend (user.Anh) → preview → placeholder chữ cái đầu -->

                        <img
                          v-if="previewUrl"
                          :src="previewUrl"
                          alt="Preview avatar"
                          class="avatar-img"
                        />
                        <img
                          v-else-if="currentUser.Anh"
                          :src="`http://localhost:3000${currentUser.Anh}`"
                          alt="Avatar"
                          class="avatar-img"
                        />
                        <div
                          v-else
                          class="avatar-placeholder d-flex align-items-center justify-content-center text-secondary fw-bold"
                        >
                          {{
                            currentUser.HoTen?.charAt(0).toUpperCase() || "U"
                          }}
                        </div>
                      </div>

                      <!-- Nút chọn ảnh -->
                      <div class="mt-3">
                        <label class="btn btn-secondary">
                          <i class="fas fa-camera me-2"></i>
                          Chọn ảnh mới
                          <input
                            type="file"
                            accept="image/*"
                            @change="onFileChange"
                            hidden
                          />
                        </label>

                        <!-- Checkbox XÓA ẢNH - chỉ hiện khi đang có ảnh (từ server hoặc preview) -->
                        <div
                          class="form-check mt-3"
                          v-if="currentUser.Anh || previewUrl"
                        >
                          <input
                            class="form-check-input"
                            type="checkbox"
                            id="removeAvatar"
                            v-model="removeAvatarChecked"
                          />
                          <label
                            class="form-check-label text-danger fw-medium"
                            @click="removeAvatar"
                          >
                            <i class="fas fa-trash-alt me-2"></i>
                            Xóa ảnh đại diện hiện tại
                          </label>
                        </div>
                      </div>
                    </div>

                    <p class="text-muted small mt-3">
                      Định dạng: Ảnh (JPG, PNG, GIF...). Tối đa 5MB
                    </p>
                  </div>

                  <!-- Cột phải: Form thông tin -->
                  <div class="col-lg-8">
                    <!-- Tên đăng nhập (không sửa được) -->
                    <div class="mb-4">
                      <label class="form-label fw-bold text-primary"
                        >Tên đăng nhập</label
                      >
                      <input
                        type="text"
                        class="form-control form-control-lg bg-light"
                        :value="currentUser.Username"
                        disabled
                      />
                      <small class="text-muted"
                        >Không thể thay đổi tên đăng nhập</small
                      >
                    </div>

                    <div class="row">
                      <!-- Họ tên -->
                      <div class="col-md-12 mb-3">
                        <label class="form-label">
                          Họ và tên <span class="text-danger">*</span>
                        </label>
                        <Field
                          name="HoTen"
                          type="text"
                          class="form-control form-control-lg"
                          placeholder="Nhập họ và tên"
                          :class="{ 'is-invalid': errors.HoTen }"
                        />
                        <ErrorMessage name="HoTen" class="invalid-feedback" />
                      </div>

                      <!-- Số điện thoại & Giới tính -->
                      <div class="col-md-6 mb-3">
                        <label class="form-label">Số điện thoại</label>
                        <Field
                          name="SoDienThoai"
                          type="tel"
                          class="form-control form-control-lg"
                          placeholder="0901234567"
                          :class="{ 'is-invalid': errors.SoDienThoai }"
                        />
                        <ErrorMessage
                          name="SoDienThoai"
                          class="invalid-feedback"
                        />
                      </div>

                      <div class="col-md-6 mb-3">
                        <label class="form-label">Giới tính</label>
                        <div class="d-flex gap-4 mt-2">
                          <label
                            class="form-check d-flex align-items-center gap-2"
                          >
                            <Field
                              name="GioiTinh"
                              type="radio"
                              value="male"
                              class="form-check-input"
                            />
                            <span>Nam</span>
                          </label>
                          <label
                            class="form-check d-flex align-items-center gap-2"
                          >
                            <Field
                              name="GioiTinh"
                              type="radio"
                              value="female"
                              class="form-check-input"
                            />
                            <span>Nữ</span>
                          </label>
                        </div>
                        <ErrorMessage
                          name="GioiTinh"
                          class="text-danger small mt-1"
                        />
                      </div>

                      <!-- Địa chỉ -->
                      <div class="col-12 mb-4">
                        <label class="form-label">Địa chỉ</label>
                        <Field
                          name="DiaChi"
                          type="text"
                          class="form-control form-control-lg"
                          placeholder="Ví dụ: Cà Mau"
                          :class="{ 'is-invalid': errors.DiaChi }"
                        />
                        <ErrorMessage name="DiaChi" class="invalid-feedback" />
                      </div>
                    </div>

                    <!-- Nút lưu -->
                    <div class="d-grid d-md-flex justify-content-end mt-4">
                      <button
                        type="submit"
                        class="btn btn-success btn-lg rounded-pill px-5 fw-bold"
                        :disabled="isSubmitting"
                      >
                        <span
                          v-if="isSubmitting"
                          class="spinner-border spinner-border-sm me-2"
                        ></span>
                        {{ isSubmitting ? "Đang lưu..." : "Lưu thay đổi" }}
                      </button>
                    </div>
                  </div>
                </div>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import readerService from "@/services/reader.service";

const currentUser = ref({});

const router = useRouter();
const loading = ref(true);

const initialValues = computed(() => ({
  HoTen: currentUser.value.HoTen || "",
  SoDienThoai: currentUser.value.SoDienThoai || "",
  DiaChi: currentUser.value.DiaChi || "",
  GioiTinh: currentUser.value.GioiTinh || "",
}));

// Schema validate (giữ nguyên key của bạn)
const schema = yup.object({
  HoTen: yup.string().required("Vui lòng nhập họ và tên"),
  SoDienThoai: yup
    .string()
    .matches(/^[0-9]{10}$/, "Số điện thoại không hợp lệ")
    .required("Vui lòng nhập số điện thoại"),
  DiaChi: yup.string().required("Vui lòng nhập địa chỉ"),
  GioiTinh: yup
    .string()
    .oneOf(["male", "female"], "Vui lòng chọn giới tính hợp lệ")
    .required("Vui lòng chọn giới tính"),
});

const previewUrl = ref("");
const selectedFile = ref(null);
const removeAvatarChecked = ref(false);

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Lỗi", "Ảnh không được quá 5MB", "error");
      return;
    }
    selectedFile.value = file;
    previewUrl.value = URL.createObjectURL(file);
    removeAvatarChecked.value = false;
  }
};

const removeAvatar = () => {
  previewUrl.value = "";
  selectedFile.value = null;
  removeAvatarChecked.value = true;
};

const onSubmit = async (values) => {
  try {
    const formData = new FormData();
    Object.keys(values).forEach((key) => {
      formData.append(key, values[key]);
    });

    if (selectedFile.value) {
      formData.append("Anh", selectedFile.value);
    } else if (removeAvatarChecked.value) {
      formData.append("removeAvatar", "true");
    }

    const res = await readerService.updateProfile(formData);

    console.log(res);
    Swal.fire({
      icon: "success",
      title: "Thành công!",
      text: "Cập nhật thông tin thành công!",
      timer: 1500,
    });

    Object.assign(currentUser.value, res);
    // if (selectedFile.value || removeAvatarChecked.value) {
    //   currentUser.value.Anh = selectedFile.value ? previewUrl.value : null;
    // }

    // Reset trạng thái
    selectedFile.value = null;
    previewUrl.value = "";
    removeAvatarChecked.value = false;
  } catch (err) {
    console.log(err);
    Swal.fire(
      "Lỗi",
      err.response?.data?.message || "Cập nhật thất bại",
      "error"
    );
  }
};

onMounted(async () => {
  try {
    const user = await readerService.me();
    console.log(user);
    if (!user || !user.Username) {
      Swal.fire("Lỗi", "Không tìm thấy thông tin tài khoản", "error");
      router.push("/login");
      return;
    }
    currentUser.value = user;
  } catch (err) {
    console.error("Lỗi load user:", err);
    router.push("/login");
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.avatar-placeholder {
  width: 130px;
  height: 130px;
  background: linear-gradient(135deg, #8b5cf6, #ec4899);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.4);
}

.card-header {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
}

.form-control-lg {
  height: 3.2rem;
}

.form-check-input:checked {
  background-color: #8b5cf6;
  border-color: #8b5cf6;
}
/* Đảm bảo ảnh preview nằm gọn trong khung tròn */
.avatar-wrapper {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 6px solid #fff;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.3);
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Placeholder chữ cái đầu - đẹp, hiện đại */
.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1976d2;
  font-size: 4.5rem;
  font-weight: 700;
  border-radius: 50%;
  user-select: none;
}
</style>