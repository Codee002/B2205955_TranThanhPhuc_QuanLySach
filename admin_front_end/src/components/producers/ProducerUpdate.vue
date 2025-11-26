<template>
  <main class="app-main p-0" style="height: 100%">
    <div class="container" style="width: 50%">
      <h2 class="text-center fw-bolder mt-4 mb-4">
        Chỉnh sửa thông tin nhà xuất bản
      </h2>
      <div
        v-if="producer.length != 0"
        class="d-flex align-items-center mb-1 row"
      >
        <Form
          @submit="onSubmit"
          :validation-schema="schema"
          :initial-values="initialValues"
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
            Xác nhận
          </button>
        </Form>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed, inject, onMounted, ref } from "vue";
import { Form, Field, ErrorMessage } from "vee-validate";
import * as yup from "yup";
import ProducerService from "@/services/producer.service";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";

onMounted(async () => {
  await getProducer(producerId);
});

// --------- Lấy dữ liệu -----------
const route = useRoute();
const router = useRouter();
const producerId = route.params.id;
let producer = ref([]);
// Lấy nhà xuất bản
const getProducer = async (producerId) => {
  try {
    producer.value = await ProducerService.get(producerId);
  } catch (error) {
    console.log(error);
    await Swal.fire({
      title: "Có lỗi khi lấy nhà xuất bản có id: " + producerId,
      producerId,
      icon: "error",
      theme: "dark",
    });
    router.push({ name: "producer" });
  }
};

const initialValues = computed(() => ({
  TenNXB: producer.value.TenNXB || "",
  DiaChi: producer.value.DiaChi || "",
}));
// -----------------------------

// -------- Xử lý form -------
const emit = defineEmits(["success"]);

const schema = yup.object({
  TenNXB: yup.string().required("Vui lòng nhập tên nhà xuất bản"),
  DiaChi: yup.string().required("Vui lòng nhập địa chỉ"),
});

const onSubmit = async (values, { resetForm }) => {
  try {
    await ProducerService.update(producerId, values);
    await Swal.fire({
      title: "Chỉnh sửa thành công!",
      icon: "success",
      theme: "dark",
    });
    router.push({ name: "producer" });
  } catch (err) {
    console.log(err);
    await Swal.fire({
      title: err.response?.data?.message,
      icon: "error",
      theme: "dark",
    });
  }
};
// ----------------------
</script>

<style scoped>
.form-control {
  height: 3rem;
}
</style>