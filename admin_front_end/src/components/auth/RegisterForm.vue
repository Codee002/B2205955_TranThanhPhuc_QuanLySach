<template>
  <Form
    @submit="onSubmit"
    :validation-schema="schema"
    v-slot="{ errors, isSubmitting }"
  >
    <h4 class="mb-4 text-center">Đăng ký Admin</h4>

    <!-- Họ và tên -->
    <div class="mb-3">
      <label class="form-label">Họ và tên</label>
      <Field
        name="hoTen"
        type="text"
        class="form-control"
        placeholder="Họ và tên"
        :class="{ 'is-invalid': errors.hoTen }"
      />
      <ErrorMessage name="hoTen" class="invalid-feedback" />
    </div>

    <!-- Số điện thoại -->
    <div class="mb-3">
      <label class="form-label">Số điện thoại</label>
      <Field
        name="soDienThoai"
        type="tel"
        class="form-control"
        placeholder="Số điện thoại"
        :class="{ 'is-invalid': errors.soDienThoai }"
      />
      <ErrorMessage name="soDienThoai" class="invalid-feedback" />
    </div>

    <!-- Địa chỉ -->
    <div class="mb-3">
      <label class="form-label">Địa chỉ</label>
      <Field
        name="diaChi"
        type="text"
        class="form-control"
        placeholder="Địa chỉ"
        :class="{ 'is-invalid': errors.diaChi }"
      />
      <ErrorMessage name="diaChi" class="invalid-feedback" />
    </div>

    <!-- Tên đăng nhập -->
    <div class="mb-3">
      <label class="form-label">Tên đăng nhập</label>
      <Field
        name="username"
        type="text"
        class="form-control"
        placeholder="Tên đăng nhập"
        :class="{ 'is-invalid': errors.username }"
      />
      <ErrorMessage name="username" class="invalid-feedback" />
    </div>

    <!-- Mật khẩu -->
    <div class="mb-3">
      <label class="form-label">Mật khẩu</label>
      <div class="input-group">
        <Field
          name="password"
          :type="showPassword ? 'text' : 'password'"
          class="form-control"
          placeholder="Mật khẩu"
          :class="{ 'is-invalid': errors.password }"
        />
        <i
          class="pwd-eye"
          @click="showPassword = !showPassword"
          :class="!showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"
        ></i>
      </div>
      <ErrorMessage name="password" class="invalid-feedback d-block" />
    </div>

    <!-- Nhập lại mật khẩu khẩu -->
    <div class="mb-3">
      <label class="form-label">Nhập lại mật khẩu</label>
      <div class="input-group">
        <Field
          name="password_confirmation"
          :type="showPassword ? 'text' : 'password'"
          class="form-control"
          placeholder="Nhập lại mật khẩu"
          :class="{ 'is-invalid': errors.password }"
        />
        <i
          class="pwd-eye"
          @click="showPassword = !showPassword"
          :class="!showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"
        ></i>
      </div>
      <ErrorMessage name="password" class="invalid-feedback d-block" />
    </div>
    <!-- Giới tính -->
    <div class="mb-3">
      <label class="form-label">Giới tính</label>
      <div class="d-flex align-items-center">
        <label
          class="form-check d-flex align-items-center gap-2"
          style="margin-right: 1rem"
        >
          <Field
            name="gioiTinh"
            type="radio"
            value="Nam"
            class="form-check-input"
          />
          Nam
        </label>
        <label class="form-check d-flex align-items-center gap-2">
          <Field
            name="gioiTinh"
            type="radio"
            value="Nữ"
            class="form-check-input"
          />
          Nữ
        </label>
      </div>
      <ErrorMessage name="gioiTinh" class="text-danger small" />
    </div>
    <!-- Nút submit -->
    <button
      type="submit"
      class="btn btn-primary w-100 mt-1 rounded mg-btn"
      :disabled="isSubmitting"
    >
      <span
        v-if="isSubmitting"
        class="spinner-border spinner-border-sm me-2"
      ></span>
      Đăng ký
    </button>
  </Form>
</template>

<script setup>
import { ref } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import authService from "@/services/auth.service";
import Swal from "sweetalert2";

const showPassword = ref(false);
const emit = defineEmits(["success"]);

const schema = yup.object({
  hoTen: yup.string().required("Vui lòng nhập họ tên"),
  username: yup.string().required("Vui lòng nhập tên đăng nhập"),
  password: yup
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .required("Vui lòng nhập mật khẩu"),
  soDienThoai: yup
    .string()
    .matches(/^[0-9]{10,11}$/, "Số điện thoại không hợp lệ")
    .required("Vui lòng nhập số điện thoại"),
  diaChi: yup.string().required("Vui lòng nhập địa chỉ"),
  gioiTinh: yup.string().required("Vui lòng chọn giới tính"),
});

const onSubmit = async (values) => {
  try {
    const registerData = {
      username: values.username,
      password: values.password,
      hoTen: values.hoTen,
      soDienThoai: values.soDienThoai,
      diaChi: values.diaChi,
      gioiTinh: values.gioiTinh,
    };
    await authService.register(registerData);

    await Swal.fire({
      title: "Thành công!",
      text: "Đăng ký thành công! Vui lòng đăng nhập",
      icon: "success",
      theme: "dark",
    });
  } catch (err) {
    await Swal.fire({
      title: "Lỗi",
      text: err.response?.data?.message || "Đăng ký thất bại",
      icon: "error",
      theme: "dark",
    });
  }
};
</script>

<style scoped>
.form-control {
  height: 3rem;
}
</style>
