<template>
  <section class="container py-5">
    <div class="row g-4 justify-content-center">
      <!-- Tổng số sách -->
      <div class="col-lg-3 col-md-6 col-sm-6">
        <div
          class="card border-0 shadow-sm h-100 bg-gradient-primary text-white"
        >
          <div class="card-body d-flex align-items-center">
            <div class="me-4">
              <i class="fas fa-book-open fa-3x opacity-75"></i>
            </div>
            <div>
              <h5 class="mb-1 fw-normal">Tổng sách</h5>
              <h3 class="fw-bold mb-0">{{ formatNumber(stats.totalBooks) }}</h3>
              <small class="opacity-90">Đầu sách</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Tổng độc giả -->
      <div class="col-lg-3 col-md-6 col-sm-6">
        <div
          class="card border-0 shadow-sm h-100 bg-gradient-success text-white"
        >
          <div class="card-body d-flex align-items-center">
            <div class="me-4">
              <i class="fas fa-users fa-3x opacity-75"></i>
            </div>
            <div>
              <h5 class="mb-1 fw-normal">Độc giả</h5>
              <h3 class="fw-bold mb-0">
                {{ formatNumber(stats.totalReaders) }}
              </h3>
              <small class="opacity-90">Thành viên</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Tổng danh mục -->
      <div class="col-lg-3 col-md-6 col-sm-6">
        <div
          class="card border-0 shadow-sm h-100 bg-gradient-warning text-white"
        >
          <div class="card-body d-flex align-items-center">
            <div class="me-4">
              <i class="fas fa-tags fa-3x opacity-75"></i>
            </div>
            <div>
              <h5 class="mb-1 fw-normal">Danh mục</h5>
              <h3 class="fw-bold mb-0">
                {{ formatNumber(stats.totalCategories) }}
              </h3>
              <small class="opacity-90">Thể loại</small>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-3 col-md-6 col-sm-6">
        <div class="card border-0 shadow-sm h-100 bg-gradient-info text-white">
          <div class="card-body d-flex align-items-center">
            <div class="me-4">
              <i class="fas fa-feather-alt fa-3x opacity-75"></i>
            </div>
            <div>
              <h5 class="mb-1 fw-normal">Tác giả</h5>
              <h3 class="fw-bold mb-0">
                {{ formatNumber(stats.totalAuthors) }}
              </h3>
              <small class="opacity-90">Nhà sáng tác</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      totalBooks: 0,
      totalReaders: 0,
      totalCategories: 0,
      totalAuthors: 0,
    }),
  },
});

// Định dạng số có dấu phẩy (1,234)
const formatNumber = (num) => {
  return Number(num || 0).toLocaleString("vi-VN");
};
</script>

<style scoped>
.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea, #764ba2) !important;
}
.bg-gradient-success {
  background: linear-gradient(135deg, #4facfe, #00f2fe) !important;
}
.bg-gradient-warning {
  background: linear-gradient(135deg, #f093fb, #f5576c) !important;
}
.bg-gradient-info {
  background: linear-gradient(135deg, #4facfe, #00c9ff) !important;
}

.card {
  border-radius: 16px;
  transition: all 0.3s ease;
}
.card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15) !important;
}
</style>