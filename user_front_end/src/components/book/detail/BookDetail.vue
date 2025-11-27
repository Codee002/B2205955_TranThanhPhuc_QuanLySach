<!-- src/components/book/detail/BookDetail.vue -->
<template>
  <div class="py-5 bg-light">
    <div class="container">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'home' }">Trang chủ</router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link :to="{ name: 'book' }">Sách</router-link>
          </li>
          <li
            class="breadcrumb-item active text-truncate"
            style="max-width: 500px"
          >
            {{ book?.TenSach }}
          </li>
        </ol>
      </nav>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div
          class="spinner-border text-primary"
          style="width: 3rem; height: 3rem"
        ></div>
      </div>

      <!-- Không tìm thấy -->
      <div v-else-if="!book" class="text-center py-5">
        <h3 class="text-danger">Không tìm thấy sách</h3>
        <router-link to="/book" class="btn btn-primary"
          >Quay về danh sách</router-link
        >
      </div>

      <!-- Nội dung chính -->
      <div v-else class="row g-5 align-items-start">
        <div class="col-lg-4">
          <div class="sticky-top" style="top: 100px">
            <img
              :src="coverUrl"
              class="img-fluid rounded-4 shadow-lg mb-4 w-100"
              style="max-height: 380px; object-fit: cover"
              alt="Bìa sách"
              @error="imgError = true"
            />
            <img v-if="imgError" class="img-fluid rounded-4 shadow-lg mb-4" />

            <!-- Các nút tải -->
            <div class="d-grid gap-3 mb-4">
              <button
                v-if="book.TrangThai == 'on'"
                class="btn btn-success btn-lg rounded-pill fw-bold"
              >
                <router-link
                  :to="{
                    name: 'borrow.confirm',
                    params: { book_id: book._id },
                  }"
                  style="color: #fff !important"
                >
                  Mượn sách
                </router-link>
              </button>

              <i v-else>Sách đã dừng cung cấp</i>
            </div>

            <!-- Thông tin nhanh ngay dưới ảnh -->
            <div class="text-start text-muted">
              <div class="mb-2">
                <strong>Tác giả:</strong>
                {{ book.TenTacGia }}
              </div>
              <div class="mb-2">
                <strong>Thể loại:</strong>
                {{ book.TheLoai }}
              </div>
              <div class="mb-2">
                <strong>Nhà xuất bản:</strong> {{ book.TenNXB || "Không rõ" }}
              </div>
              <div class="mb-2">
                <strong>Năm xuất bản:</strong> {{ book.NamXuatBan || "—" }}
              </div>
              <div>
                <strong>Giá bìa: </strong>
                <span class="text-danger fw-bold">{{
                  formatPrice(book.DonGia)
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Nội dung chi tiết bên phải -->
        <div class="col-lg-8">
          <h1 class="display-7 fw-bold text-primary mb-4">
            {{ book.TenSach }}
          </h1>

          <!-- Mô tả sách -->
          <div class="bg-white rounded-4 p-4 shadow-sm mb-5">
            <h5 class="fw-bold text-success mb-3">Giới thiệu sách</h5>
            <div
              v-html="book.MoTa"
              class="lead text-dark"
              style="line-height: 1.8"
            ></div>
          </div>

          <!-- Sách cùng thể loại – chỉ 4 cuốn -->
          <RelatedBooks
            :categoryId="book.TheLoai_id"
            :excludeId="book._id"
            :limit="4"
          />

          <!-- Nút quay lại -->
          <div class="text-center mt-5">
            <router-link
              :to="{ name: 'book' }"
              class="btn btn-secondary text-white rounded-pill px-5 py-3"
            >
              Quay về danh sách sách
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import BookService from "@/services/book.service";
import RelatedBooks from "./RelatedBooks.vue";

const route = useRoute();
const book = ref(null);
const loading = ref(true);
const imgError = ref(false);

const baseUrl = import.meta.env.VITE_BACKEND_URL;
const coverUrl = computed(() =>
  book.value?.Anh ? `${baseUrl}${book.value.Anh}` : "/images/no-image.jpg"
);

onMounted(async () => {
  loading.value = true;
  try {
    book.value = await BookService.get(route.params.id);
  } catch (err) {
    console.error("Lỗi tải sách:", err);
  } finally {
    loading.value = false;
  }
});

const formatPrice = (price) =>
  price
    ? new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price)
    : "Miễn phí";
</script>

<style scoped>
.bg-purple {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}
.breadcrumb-item + .breadcrumb-item::before {
  content: "›";
}
</style>