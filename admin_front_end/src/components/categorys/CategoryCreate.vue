<template>
  <main class="app-main p-0" style="height: 100%">
    <div class="container" style="width: 50%">
      <h2 class="text-center fw-bolder mt-4 mb-4">Thêm danh mục</h2>
      <div class="d-flex align-items-center mb-1 row">
        <Form
          @submit="onSubmit"
          :validation-schema="schema"
          v-slot="{ errors, isSubmitting }"
        >
          <!-- Họ và tên -->
          <div class="mb-3">
            <label class="form-label">Tên danh mục</label>
            <Field
              name="Ten"
              type="text"
              class="form-control"
              placeholder="Tên danh mục"
              :class="{ 'is-invalid': errors.Ten }"
            />
            <ErrorMessage name="Ten" class="invalid-feedback" />
          </div>

          <!-- Nút submit -->
          <button
            type="submit"
            class="btn btn-primary w-100 mt-1 rounded mg-btn"
            style="width: 30% !important; place-self: flex-end"
            :disabled="isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            Thêm danh mục
          </button>
        </Form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import CategoryService from "@/services/category.service";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const router = useRouter();
const showPassword = ref(false);
const emit = defineEmits(["success"]);

const schema = yup.object({
  Ten: yup.string().required("Vui lòng nhập tên danh mục"),
});

const onSubmit = async (values, { resetForm }) => {
  try {
    console.log(values);
    await CategoryService.create(values);
    await Swal.fire({
      title: "Thêm danh mục thành công!",
      icon: "success",
      theme: "dark",
    });
    router.push({ name: "category" });
  } catch (err) {
    console.log(err);
    await Swal.fire({
      title: err.response?.data?.message,
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