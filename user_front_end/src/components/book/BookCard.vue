<template>
  <router-link
    :to="`/book/${book._id}`"
    class="text-decoration-none text-dark d-block h-100"
  >
    <div class="card border-0 shadow-sm hover-shadow h-100">
      <img
        :src="book.Anh ? `http://localhost:3000${book.Anh}` : null"
        class="card-img-top"
        alt="bìa sách"
        style="height: 280px; object-fit: cover"
      />

      <div class="card-body d-flex flex-column p-3">
        <h6 class="fw-bold line-clamp-3 mb-2">{{ book.TenSach }}</h6>
        <p class="text-muted small mb-1">
          {{ book.TenTacGia || "Không rõ tác giả" }}
        </p>

        <div class="mt-auto">
          <small class="text-success fw-medium">
            {{ book.thongKePhieuMuon.SoLuongConLai }} bản còn lại
          </small>
        </div>

        <small class="text-primary fw-medium">
          {{ Number(book.DonGia).toLocaleString("vi-VN") }}đ
        </small>
      </div>
    </div>
  </router-link>
</template>

<script setup>
defineProps({
  book: Object,
});
</script>

<style scoped>
.hover-shadow:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.12) !important;
  transition: all 0.3s ease;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>