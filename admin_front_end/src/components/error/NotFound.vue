<template>
  <div class="notfound">
    <div class="content">
      <i class="fas fa-exclamation-triangle fa-5x text-danger mb-4"></i>

      <h1 class="display-5 fw-bold text-danger">404</h1>
      <h3 class="mb-3 text-white">Oops! Không tìm thấy trang</h3>
      <p class="text-muted mb-4">
        Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không
        có.
      </p>

      <div class="d-flex gap-3 justify-content-center flex-wrap">
        <router-link to="/dashboard" class="btn btn-primary px-4 text-white">
          Về trang quản lý
        </router-link>

        <button @click="goBack" class="btn btn-outline-secondary px-4">
          Quay lại
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "NotFound",
  methods: {
    goBack() {
      this.$router.go(-1);
    },
  },
};
</script>

<style scoped>
.notfound {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: #000; /* Nền đen thuần */
  color: #fff !important;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.content {
  text-align: center;
  background: rgba(30, 30, 30, 0.95); /* Nền thẻ hơi xám đen */
  padding: 60px 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  max-width: 500px;
  width: 100%;
  border: 1px solid #333; /* Viền nhẹ cho nổi khối */
}

/* 404 và tiêu đề giữ nguyên */
.display-5 {
  font-size: 90px;
  margin: 10px 0;
}

/* Màu chữ mô tả */
.text-muted {
  color: #aaaaaa !important;
  font-size: 16px;
}

/* Nút Về trang chủ - nổi bật trên nền đen */
.btn-primary {
  background-color: #0d6efd; /* Xanh dương chuẩn Bootstrap */
  border: none;
  font-weight: 600;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}

/* Nút Quay lại - viền trắng cho dễ thấy */
.btn-outline-secondary {
  border-color: #666;
  color: #ddd;
}

.btn-outline-secondary:hover {
  background-color: #444;
  color: white;
  border-color: #666;
}

/* Responsive giữ nguyên */
@media (max-width: 480px) {
  .content {
    padding: 40px 20px;
  }
  .display-5 {
    font-size: 70px;
  }
}
</style>