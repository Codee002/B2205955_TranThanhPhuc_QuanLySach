<template>
  <main class="app-main p-0" style="height: 100%">
    <div class="container" style="max-width: 900px">
      <div class="text-center my-5">
        <h2 class="fw-bolder">Tạo phiếu mượn sách</h2>
        <p class="text-muted">Cho độc giả mượn sách từ hệ thống quản lý</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div
          class="spinner-border text-primary"
          style="width: 4rem; height: 4rem"
        ></div>
      </div>

      <!-- Không tìm thấy sách -->
      <div v-else-if="!book" class="text-center py-5">
        <i class="fas fa-book fa-5x text-muted mb-4"></i>
        <h4 class="text-danger">Không tìm thấy sách</h4>
        <button @click="router.back()" class="btn btn-outline-primary mt-3">
          Quay lại
        </button>
      </div>

      <!-- Nội dung chính -->
      <div v-else class="card border-0 shadow-lg overflow-hidden">
        <div class="card-body p-0">
          <div class="row g-0">
            <!-- Ảnh sách + Thông tin cơ bản -->
            <div
              class="col-lg-5 bg-gradient-primary text-white p-5 d-flex flex-column justify-content-center"
            >
              <div class="text-center mb-4">
                <img
                  :src="baseUrl + book.Anh"
                  class="img-fluid rounded-3 shadow-lg"
                  style="
                    max-height: 420px;
                    object-fit: cover;
                    border: 6px solid rgba(255, 255, 255, 0.3);
                  "
                  :alt="book.TenSach"
                  onerror="this.src='/images/no-image.jpg'"
                />
              </div>
              <h3 class="fw-bold text-center mt-4">{{ book.TenSach }}</h3>
              <p class="text-center opacity-90 mb-1">
                <i class="fas fa-user-edit me-2"></i>{{ book.TenTacGia }}
              </p>
              <div class="text-center mt-3">
                <span class="badge bg-light text-primary px-4 py-2 fs-6">
                  {{ book.TheLoai }}
                </span>
              </div>
              <div class="mt-4 text-center">
                <p class="mb-2 opacity-90">
                  Nhà xuất bản: <strong>{{ book.TenNXB }}</strong>
                </p>
                <p class="mb-0 opacity-90">
                  Năm XB: <strong>{{ book.NamXuatBan }}</strong>
                </p>
              </div>
            </div>

            <!-- Form tạo phiếu -->
            <div class="col-lg-7 p-5">
              <h4 class="fw-bold text-primary mb-4">
                <i class="fas fa-user-plus me-2"></i>Chọn độc giả mượn sách
              </h4>

              <!-- Select độc giả (có tìm kiếm) -->
              <div class="mb-4">
                <label class="form-label fw-bold">
                  Độc giả <span class="text-danger">*</span>
                </label>
                <select
                  v-model="selectedDocGiaId"
                  class="form-select"
                  :class="{ 'is-invalid': docGiaError }"
                  @change="docGiaError = ''"
                >
                  <option value="">
                    -- Nhập tên hoặc mã độc giả để tìm --
                  </option>
                  <option
                    v-for="dg in filteredDocGias"
                    :key="dg._id"
                    :value="dg._id"
                  >
                    {{ dg.HoTen }} ({{ dg._id }})
                  </option>
                </select>
                <input
                  type="text"
                  class="form-control mt-2"
                  placeholder="Tìm nhanh theo tên hoặc mã..."
                  v-model="searchDocGia"
                />
                <div v-if="docGiaError" class="text-danger small mt-1">
                  {{ docGiaError }}
                </div>
              </div>

              <!-- Thống kê hiện tại -->
              <div class="alert alert-info py-3">
                <div class="row text-center">
                  <div class="col-6 col-md-3">
                    <small class="d-block">Tổng số lượng</small>
                    <strong class="fs-5">{{ book.SoLuong }}</strong>
                  </div>
                  <div class="col-6 col-md-3">
                    <small class="d-block">Đang mượn</small>
                    <strong class="fs-5 text-info">{{
                      stats["Đang mượn"]
                    }}</strong>
                  </div>
                  <div class="col-6 col-md-3">
                    <small class="d-block">Chờ duyệt</small>
                    <strong class="fs-5 text-warning">{{
                      stats["Chờ duyệt"]
                    }}</strong>
                  </div>
                  <div class="col-6 col-md-3">
                    <small class="d-block text-success">Còn lại</small>
                    <strong class="fs-5 text-success">{{
                      stats.SoLuongConLai
                    }}</strong>
                  </div>
                </div>
              </div>

              <!-- Cảnh báo nếu không còn sách -->
              <div v-if="stats.SoLuongConLai <= 0" class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Sách đã hết! Không thể tạo phiếu mượn.
              </div>

              <!-- Nút hành động -->
              <div class="text-end mt-4">
                <button
                  @click="router.back()"
                  class="btn btn-secondary me-3 px-4"
                >
                  Hủy
                </button>
                <button
                  @click="createBorrow"
                  class="btn btn-primary px-5"
                  :disabled="
                    isSubmitting ||
                    stats.SoLuongConLai <= 0 ||
                    !selectedDocGiaId
                  "
                >
                  <span
                    v-if="isSubmitting"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  Tạo phiếu mượn
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import Swal from "sweetalert2";
import SachService from "@/services/book.service";
import DocGiaService from "@/services/reader.service";
import PhieuMuonService from "@/services/borrow.service";

const route = useRoute();
const router = useRouter();
const bookId = route.params.id;

const book = ref(null);
const loading = ref(true);
const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const docGias = ref([]);
const searchDocGia = ref("");
const selectedDocGiaId = ref("");
const docGiaError = ref("");
const isSubmitting = ref(false);

const stats = computed(
  () =>
    book.value?.thongKePhieuMuon || {
      "Đang mượn": 0,
      "Chờ duyệt": 0,
      "Đã trả": 0,
      "Đã hủy": 0,
      SoLuongConLai: 0,
    }
);

const filteredDocGias = computed(() => {
  if (!searchDocGia.value) return docGias.value;
  const term = searchDocGia.value.toLowerCase();
  return docGias.value.filter(
    (dg) =>
      dg.HoTen.toLowerCase().includes(term) ||
      dg._id.toLowerCase().includes(term)
  );
});

const loadData = async () => {
  try {
    loading.value = true;
    // Lấy sách + thống kê
    book.value = await SachService.get(bookId);
    if (!book.value) throw new Error("Không tìm thấy sách");

    // Lấy danh sách độc giả
    const docGiaResponse = await DocGiaService.getAll();
    docGias.value = docGiaResponse.data || [];
  } catch (err) {
    await Swal.fire({
      title: "Lỗi",
      text: err.response?.data?.message || "Có lỗi xảy ra",
      icon: "error",
      theme: "dark",
    });
    router.back();
  } finally {
    loading.value = false;
  }
};

const createBorrow = async () => {
  if (!selectedDocGiaId.value) {
    docGiaError.value = "Vui lòng chọn độc giả";
    return;
  }

  isSubmitting.value = true;
  try {
    console.log(selectedDocGiaId.value);
    await PhieuMuonService.createFormAdmin({
      Sach_id: bookId,
      DocGia_id: selectedDocGiaId.value,
    });

    await Swal.fire({
      icon: "success",
      title: "Thành công!",
      text: "Phiếu mượn đã được tạo và đang chờ duyệt",
      timer: 2000,
      showConfirmButton: false,
      theme: "dark",
    });

    router.push({ name: "borrow" });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Không thể tạo phiếu",
      text: err.response?.data?.message || "Lỗi khi tạo phiếu mượn",
      theme: "dark",
    });
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(loadData);
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.card:hover {
  transform: translateY(-5px);
  transition: all 0.3s ease;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}
.form-select-lg {
  height: 3.5rem;
}
.alert {
  border-radius: 12px;
}
</style>