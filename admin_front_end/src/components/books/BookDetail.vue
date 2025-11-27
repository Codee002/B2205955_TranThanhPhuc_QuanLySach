<template>
  <main class="app-main p-0" style="height: 100%">
    <div class="container" style="max-width: 900px">
      <div class="text-center my-5">
        <h2 class="fw-bolder text-primary">Chi tiết sách</h2>
        <p class="text-muted">Thông tin đầy đủ và thống kê mượn sách</p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div
          class="spinner-border text-primary"
          style="width: 4rem; height: 4rem"
        ></div>
      </div>

      <!-- Không tìm thấy -->
      <div v-else-if="!book" class="text-center py-5">
        <i class="fas fa-book fa-5x text-muted mb-4"></i>
        <h4 class="text-danger">Không tìm thấy sách</h4>
        <router-link
          :to="{ name: 'book' }"
          class="btn btn-outline-primary mt-3"
        >
          Quay lại danh sách sách
        </router-link>
      </div>

      <!-- Nội dung chính -->
      <div v-else class="card border-0 shadow-lg overflow-hidden">
        <div class="card-body p-0">
          <div class="row g-0">
            <!-- Ảnh bìa + Thông tin cơ bản -->
            <div
              class="col-lg-5 bg-gradient-primary text-white p-5 d-flex flex-column justify-content-center position-relative"
            >
              <div class="text-center mb-4">
                <img
                  :src="baseUrl + book.Anh"
                  class="img-fluid rounded-3 shadow-lg"
                  style="
                    max-height: 450px;
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
            </div>

            <!-- Thông tin chi tiết -->
            <div class="col-lg-7 p-5">
              <h4 class="fw-bold text-primary mb-4">
                <i class="fas fa-info-circle me-2"></i>Thông tin chi tiết
              </h4>

              <div class="row g-4">
                <div class="col-md-6">
                  <div class="d-flex align-items-center">
                    <i class="fas fa-tag text-primary fs-4 me-3"></i>
                    <div>
                      <small class="text-muted">Nhà xuất bản</small>
                      <p class="fw-bold mb-0">{{ book.TenNXB }}</p>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="d-flex align-items-center">
                    <i class="fas fa-calendar-alt text-success fs-4 me-3"></i>
                    <div>
                      <small class="text-muted">Năm xuất bản</small>
                      <p class="fw-bold mb-0">{{ book.NamXuatBan }}</p>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="d-flex align-items-center">
                    <i
                      class="fas fa-money-bill-wave text-success fs-4 me-3"
                    ></i>
                    <div>
                      <small class="text-muted">Đơn giá</small>
                      <p class="fw-bold mb-0 text-success">
                        {{ formatCurrency(book.DonGia) }}đ
                      </p>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="d-flex align-items-center">
                    <i class="fas fa-cubes text-info fs-4 me-3"></i>
                    <div>
                      <small class="text-muted">Tổng số lượng</small>
                      <p class="fw-bold mb-0">{{ book.SoLuong }} cuốn</p>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="d-flex align-items-center">
                    <i class="fas fa-toggle-on text-primary fs-4 me-3"></i>
                    <div>
                      <small class="text-muted">Trạng thái hiển thị</small>
                      <p class="fw-bold mb-0">
                        <span
                          class="badge px-3 py-2"
                          :class="
                            book.TrangThai === 'on'
                              ? 'bg-success'
                              : 'bg-secondary'
                          "
                        >
                          {{
                            book.TrangThai === "on" ? "Đang hiển thị" : "Đã ẩn"
                          }}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <hr class="my-4" />
                  <h5 class="fw-bold text-primary">
                    <i class="fas fa-chart-bar me-2"></i>Thống kê mượn sách
                  </h5>
                  <div class="row g-3 mt-3">
                    <div class="col-6 col-md-4">
                      <div
                        class="text-center p-3 bg-dark border rounded shadow-sm"
                      >
                        <i class="fas fa-book-reader text-info fs-3"></i>
                        <p class="fw-bold mt-2 mb-0">
                          {{ stats["Đang mượn"] }}
                        </p>
                        <small class="text-muted">Đang mượn</small>
                      </div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div
                        class="text-center p-3 bg-dark border rounded shadow-sm"
                      >
                        <i class="fas fa-clock text-warning fs-3"></i>
                        <p class="fw-bold mt-2 mb-0">
                          {{ stats["Chờ duyệt"] }}
                        </p>
                        <small class="text-muted">Chờ duyệt</small>
                      </div>
                    </div>
                    <div class="col-6 col-md-4">
                      <div
                        class="text-center p-3 bg-dark border rounded shadow-sm"
                      >
                        <i class="fas fa-check-double text-success fs-3"></i>
                        <p class="fw-bold mt-2 mb-0">{{ stats["Đã trả"] }}</p>
                        <small class="text-muted">Đã trả</small>
                      </div>
                    </div>

                    <div class="col-6 col-md-4">
                      <div
                        class="text-center p-3 bg-dark border rounded shadow-sm"
                      >
                        <i class="fas fa-ban text-danger fs-3"></i>
                        <p class="fw-bold mt-2 mb-0">{{ stats["Đã hủy"] }}</p>
                        <small class="text-muted">Đã hủy</small>
                      </div>
                    </div>

                    <div class="col-6 col-md-4">
                      <div
                        class="text-center p-3 bg-dark border rounded shadow-sm"
                      >
                        <i class="fas fa-delete-left text-danger fs-3"></i>
                        <p class="fw-bold mt-2 mb-0">{{ stats["Đã hủy"] }}</p>
                        <small class="text-muted">Đã hủy</small>
                      </div>
                    </div>
                    <div class="col-12 text-center mt-3">
                      <div class="alert alert-success py-3">
                        <strong>Còn lại: {{ stats.SoLuongConLai }} cuốn</strong>
                        có thể mượn ngay
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <hr class="my-4" />
                  <h5 class="fw-bold text-primary">
                    <i class="fas fa-align-left me-2"></i>Mô tả sách
                  </h5>
                  <p
                    class="text-muted lh-lg"
                    v-html="book.MoTa || 'Chưa có mô tả'"
                  ></p>
                </div>
              </div>

              <!-- Nút hành động -->
              <div class="text-end mt-5">
                <button @click="router.back()" class="btn btn-secondary me-2">
                  Quay lại
                </button>
                <router-link
                  :to="{ name: 'book.update', params: { id: book._id } }"
                  class="btn btn-warning fw-bold me-2"
                >
                  Chỉnh sửa
                </router-link>
                <router-link
                  :to="{ name: 'borrow.create', params: { id: book._id } }"
                  class="btn btn-success"
                >
                  Tạo phiếu mượn
                </router-link>
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

const route = useRoute();
const router = useRouter();
const bookId = route.params.id;

const book = ref(null);
const loading = ref(true);
const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const stats = computed(
  () =>
    book.value?.thongKePhieuMuon || {
      "Đang mượn": 0,
      "Chờ duyệt": 0,
      "Đã trả": 0,
      "Đã hủy": 0,
      SoLuongConLai: book.value?.SoLuong || 0,
    }
);

const formatCurrency = (num) => new Intl.NumberFormat("vi-VN").format(num || 0);

onMounted(async () => {
  if (!bookId) {
    await Swal.fire({
      title: "Lỗi",
      text: err.response?.data?.message || "Có lỗi xảy ra",
      icon: "error",
      theme: "dark",
    });
    router.push({ name: "book" });
    return;
  }

  try {
    loading.value = true;
    book.value = await SachService.get(bookId);
    if (!book.value) throw new Error("Không tìm thấy sách");
  } catch (err) {
    console.error(err);
    await Swal.fire({
      title: "Lỗi",
      text: err.response?.data?.message || "Có lỗi xảy ra",
      icon: "error",
      theme: "dark",
    });
    router.push({ name: "book" });
  } finally {
    loading.value = false;
  }
});
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
.alert {
  border-radius: 12px;
}
</style>