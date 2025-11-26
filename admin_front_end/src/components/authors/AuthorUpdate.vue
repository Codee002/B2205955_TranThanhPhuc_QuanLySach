<template>
  <main class="app-main p-0" style="height: 100%">
    <div class="container" style="width: 50%">
      <h2 class="text-center fw-bolder mt-4 mb-4">
        Chỉnh sửa thông tin tác giả
      </h2>
      <div v-if="author.length != 0" class="d-flex align-items-center mb-1 row">
        <Form
          @submit="onSubmit"
          :validation-schema="schema"
          :initial-values="initialValues"
          v-slot="{ errors, isSubmitting }"
        >
          <!-- Họ và tên -->
          <div class="mb-3">
            <label class="form-label">Họ và tên</label>
            <Field
              name="HoTen"
              type="text"
              class="form-control"
              placeholder="Họ và tên"
              :class="{ 'is-invalid': errors.HoTen }"
            />
            <ErrorMessage name="HoTen" class="invalid-feedback" />
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
import AuthorService from "@/services/author.service";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";

onMounted(async () => {
  await getAuthor(authorId);
});

// --------- Lấy dữ liệu -----------
const route = useRoute();
const router = useRouter();
const authorId = route.params.id;
let author = ref([]);
// Lấy tác giả
const getAuthor = async (authorId) => {
  try {
    author.value = await AuthorService.get(authorId);
  } catch (error) {
    console.log(error);
    alert("Có lỗi khi lấy tác giả có id: ", authorId);
    router.push({ name: "author" });
  }
};

const initialValues = computed(() => ({
  HoTen: author.value.HoTen || "",
  DiaChi: author.value.DiaChi || "",
}));
// -----------------------------

// -------- Xử lý form -------
const emit = defineEmits(["success"]);

const schema = yup.object({
  HoTen: yup.string().required("Vui lòng nhập họ tên"),
  DiaChi: yup.string().required("Vui lòng nhập địa chỉ"),
});

const onSubmit = async (values, { resetForm }) => {
  try {
    await AuthorService.update(authorId, values);
    await Swal.fire({
      title: "Chỉnh sửa thành công!",
      icon: "success",
      theme: "dark",
    });
    router.push({ name: "author" });
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