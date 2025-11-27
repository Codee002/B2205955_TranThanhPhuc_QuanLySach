<!-- src/components/auth/LoginForm.vue -->
<template>
  <Form
    @submit="onSubmit"
    :validation-schema="schema"
    v-slot="{ isSubmitting }"
  >
    <h4 class="mb-4 text-center">Admin Đăng nhập</h4>

    <!-- Username -->
    <div class="mb-3">
      <label class="form-label">Tên đăng nhập</label>
      <Field
        name="username"
        type="text"
        class="form-control"
        placeholder="Tên đăng nhập"
        v-slot="{ field, errorMessage, meta }"
      >
        <input
          v-bind="field"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': meta.touched && errorMessage }"
          placeholder="Tên đăng nhập"
        />
        <div class="invalid-feedback d-block">{{ errorMessage }}</div>
      </Field>
    </div>

    <!-- Password -->
    <div class="mb-3">
      <label class="form-label">Mật khẩu</label>
      <Field name="password" v-slot="{ field, errorMessage, meta }">
        <div class="input-group">
          <input
            v-bind="field"
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
            :class="{ 'is-invalid': meta.touched && errorMessage }"
            placeholder="Mật khẩu"
          />
          <i
            class="pwd-eye"
            @click="showPassword = !showPassword"
            :class="!showPassword ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'"
          ></i>
        </div>
        <div class="invalid-feedback d-block">{{ errorMessage }}</div>
      </Field>
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
      Đăng nhập
    </button>
  </Form>
</template>

<script setup>
import authService from "@/services/auth.service";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import { ref } from "vue";

const router = useRouter();

const emit = defineEmits(["success"]);
const showPassword = ref(false);

const schema = yup.object({
  username: yup.string().required("Vui lòng nhập tên đăng nhập"),
  password: yup.string().required("Vui lòng nhập mật khẩu"),
});

const onSubmit = async (values) => {
  try {
    await authService.loginAdmin(values);
    router.push("/dashboard");
  } catch (err) {
    await Swal.fire({
      title: "Lỗi",
      text: err.response?.data?.message || "Đăng nhập thất bại",
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
