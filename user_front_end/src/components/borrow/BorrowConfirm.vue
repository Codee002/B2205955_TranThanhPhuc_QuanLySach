<!-- src/views/BorrowConfirm.vue -->
<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div
          class="spinner-border text-primary"
          style="width: 3.5rem; height: 3.5rem"
        ></div>
      </div>

      <!-- Không tìm thấy -->
      <div v-else-if="!book" class="text-center py-5">
        <h4 class="text-danger">Không tìm thấy sách</h4>
        <router-link to="/book" class="btn btn-outline-primary mt-3"
          >Quay lại</router-link
        >
      </div>

      <div v-else class="row g-5">
        <div class="col-lg-5">
          <div
            class="card border-0 shadow rounded-4 overflow-hidden sticky-top"
            style="top: 90px"
          >
            <img
              :src="coverUrl"
              class="w-100"
              style="height: 500px; object-fit: cover"
              alt="Bìa sách"
            />

            <div class="card-body p-4 bg-white">
              <h5 class="fw-bold text-primary mb-3">{{ book.TenSach }}</h5>

              <div class="small text-muted lh-lg">
                <div><strong>Thể loại:</strong> {{ book.TheLoai }}</div>
                <div>
                  <strong>Tác giả:</strong> {{ book.TenTacGia || "Không rõ" }}
                </div>
                <div><strong>Nhà xuất bản:</strong> {{ book.TenNXB }}</div>
                <div>
                  <strong> Số lượng còn lại: </strong>
                  <strong class="text-success">
                    {{ book.thongKePhieuMuon.SoLuongConLai || 0 }} cuốn
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Cột phải: Thông tin mượn -->
        <div class="col-lg-7">
          <div class="card border-0 shadow rounded-4 h-100">
            <div
              class="card-header bg-primary text-white py-4 text-center rounded-top-4"
            >
              <h4 class="mb-0 fw-bold">Xác nhận mượn sách</h4>
            </div>

            <div class="card-body p-5">
              <!-- Thông tin mượn -->
              <div class="row g-4 mb-5">
                <div class="col-md-6">
                  <div
                    class="p-4 bg-light rounded-4 border-start border-primary border-4"
                  >
                    <small class="text-muted d-block mb-1">Ngày mượn</small>
                    <p class="fw-bold fs-4 text-primary mb-0">
                      {{ formatDate(ngayMuon) }}
                    </p>
                  </div>
                </div>
                <div class="col-md-6">
                  <div
                    class="p-4 bg-light rounded-4 border-start border-danger border-4"
                  >
                    <small class="text-muted d-block mb-1">Hạn trả</small>
                    <p class="fw-bold fs-4 text-danger mb-0">
                      7 ngày kể từ ngày duyệt
                    </p>
                  </div>
                </div>
              </div>

              <!-- Phạt muộn -->
              <div
                class="alert alert-warning rounded-4 py-4 mb-5 d-flex align-items-center"
              >
                <i
                  class="bi bi-exclamation-triangle-fill fs-3 me-3 text-warning"
                ></i>
                <div>
                  <strong class="d-block">Phạt trả muộn:</strong>
                  <span class="fs-4 fw-bold text-danger">10.000đ / ngày</span>
                </div>
              </div>

              <!-- Nút hành động -->
              <div class="d-flex justify-content-end">
                <button class="btn btn-secondary fw-bold me-3">
                  <router-link
                    :to="`/book/${book._id}`"
                    style="color: #fff !important"
                  >
                    Quay lại
                  </router-link>
                </button>
                <button
                  @click="confirmBorrow"
                  class="btn btn-success fw-bold py-3"
                  :disabled="submitting || book.SoLuong <= 0"
                >
                  <span
                    v-if="submitting"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  {{ submitting ? "Đang xử lý..." : "Xác nhận" }}
                </button>
              </div>

              <!-- Thông báo hết sách -->
              <div v-if="book.SoLuong <= 0" class="text-center mt-4">
                <small class="text-danger fw-bold">
                  Sách hiện đã hết! Không thể mượn.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import BookService from "@/services/book.service";
import BorrowService from "@/services/borrow.service";
import authService from "@/services/auth.service";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();

const book = ref(null);
const loading = ref(true);
const submitting = ref(false);

const ngayMuon = new Date();

const baseUrl = import.meta.env.VITE_BACKEND_URL;
const coverUrl = computed(() => {
  if (!book.value?.Anh) return "/images/no-image.jpg";
  return `${baseUrl}${book.value.Anh}`;
});

onMounted(async () => {
  const id = route.params.book_id;
  if (!id) {
    router.push("/books");
    return;
  }

  try {
    book.value = await BookService.get(id);
    console.log(book.value);
  } catch (err) {
    console.error("Lỗi tải sách:", err);
    Swal.fire("Lỗi", "Không thể tải thông tin sách", "error");
  } finally {
    loading.value = false;
  }
});

const formatDate = (date) => {
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const confirmBorrow = async () => {
  const result = await Swal.fire({
    title: "Xác nhận",
    text: "Bạn sẽ tạo đơn mượn này?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xác nhận",
    cancelButtonText: "Hủy",
  });

  if (result.isConfirmed) {
    if (book.value.SoLuong <= 0) {
      Swal.fire(
        "Hết sách",
        "Cuốn sách này hiện đã hết, không thể mượn",
        "warning"
      );
      return;
    }

    try {
      submitting.value = true;
      const user = await authService.getCurrentUser();

      if (!user) {
        submitting.value = false;
        router.push("/login");
        return;
      }

      // Gọi API
      const res = await BorrowService.create({
        Sach_id: book.value._id,
      });

      await Swal.fire({
        // title: "Thành công!",
        text: `Tạo đơn mượn sách thành công!`,
        icon: "success",
      });
      router.push("/book");
    } catch (err) {
      console.log(err);
      Swal.fire({
        title: "Lỗi",
        text: err.response?.data?.message || "Có lỗi khi mượn sách",
        icon: "error",
      });
    } finally {
      submitting.value = false;
    }
  }
};
</script>

<style scoped>
.card-header {
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
}
.border-4 {
  border-width: 4px !important;
}
small {
  font-size: 0.875rem;
}
</style>