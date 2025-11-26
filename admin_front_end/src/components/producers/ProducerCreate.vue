<template>
  <main class="app-main p-0" style="height: 100%">
    <div class="container" style="width: 50%">
      <h2 class="text-center fw-bolder mt-4 mb-4">Thêm nhà xuất bản</h2>
      <div class="d-flex align-items-center mb-1 row">
        <Form
          @submit="onSubmit"
          :validation-schema="schema"
          v-slot="{ errors, isSubmitting }"
        >
          <!-- Họ và tên -->
          <div class="mb-3">
            <label class="form-label">Tên nhà xuất bản</label>
            <Field
              name="TenNXB"
              type="text"
              class="form-control"
              placeholder="Tên nhà xuất bản"
              :class="{ 'is-invalid': errors.TenNXB }"
            />
            <ErrorMessage name="TenNXB" class="invalid-feedback" />
          </div>

          <!-- Địa chỉ -->
          <div class="mb-3">
            <label class="form-label">Địa chỉ</label>
            <Field
              name="DiaChi"
              type="text"
              class="form-control"
              placeholder="Địa chỉ"
              :class="{ 'is-invalid': errors.DiaChi }"
            />
            <ErrorMessage name="DiaChi" class="invalid-feedback" />
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
            Thêm nhà xuất bản
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
import ProducerService from "@/services/producer.service";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";

const router = useRouter();

const schema = yup.object({
  TenNXB: yup.string().required("Vui lòng nhập tên nhà xuất bản"),
  DiaChi: yup.string().required("Vui lòng nhập địa chỉ"),
});

const onSubmit = async (values, { resetForm }) => {
  try {
    console.log(values);
    await ProducerService.create(values);
    await Swal.fire({
      title: "Thêm nhà xuất bản thành công!",
      icon: "success",
      theme: "dark",
    });
    router.push({ name: "producer" });
  } catch (err) {
    await Swal.fire({
      title: err.response?.data?.message || "Có lỗi xảy ra",
      icon: "error",
      theme: "dark",
    });
    console.log(err);
  }
};
</script>

<style scoped>
.form-control {
  height: 3rem;
}
</style>