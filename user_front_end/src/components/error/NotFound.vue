<template>
  <div class="notfound">
    <div class="content">
      <i class="fas fa-exclamation-triangle fa-5x text-danger mb-4"></i>
      <!-- hoặc dùng sách: <i class="fas fa-book-open fa-5x text-primary mb-4"></i> -->

      <h1 class="display-5 fw-bold text-danger">404</h1>
      <h3 class="mb-3">Oops! Không tìm thấy trang</h3>
      <p class="text-muted mb-4">
        Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không
        có.
      </p>

      <div class="d-flex gap-3 justify-content-center flex-wrap">
        <router-link to="/home" class="btn btn-primary px-4 text-white">
          Về trang chủ
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
  background: linear-gradient(to bottom, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.content {
  text-align: center;
  background: white;
  padding: 60px 40px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

.display-4 {
  font-size: 80px;
  margin: 20px 0 10px;
  color: #333;
}

h3 {
  color: #444;
  font-weight: 600;
}

.text-muted {
  font-size: 16px;
}

.btn-primary {
  background-color: #007bff;
  border: none;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-outline-secondary {
  border-color: #6c757d;
  color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  color: white;
}

/* Responsive */
@media (max-width: 480px) {
  .display-4 {
    font-size: 60px;
  }
  .content {
    padding: 40px 20px;
  }
}
</style>