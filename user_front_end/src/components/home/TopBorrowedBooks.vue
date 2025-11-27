<template>
  <section class="container py-5">
    <h2 class="h4 fw-bold mb-4 text-primary">Sách Được Mượn Nhiều Nhất</h2>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <div v-else-if="books.length === 0" class="text-center py-5 text-muted">
      <i class="fas fa-book-open fa-3x mb-3"></i>
      <p>Chưa có lượt mượn nào</p>
    </div>

    <div v-else class="row g-4">
      <div
        v-for="book in books"
        :key="book.id"
        class="col-6 col-sm-4 col-md-3 col-lg-3 col-xl-2"
      >
        <router-link
          :to="{ name: 'book.detail', params: { id: book.id } }"
          class="text-decoration-none text-dark d-block h-100"
        >
          <div class="card border-0 shadow-sm hover-shadow h-100">
            <div class="position-relative">
              <img
                :src="book.cover"
                class="card-img-top"
                alt="cover"
                style="height: 280px; object-fit: cover"
                onerror="this.src='/images/no-book.jpg'"
              />
              <div class="position-absolute top-0 start-0 m-2">
                <span class="badge bg-danger fs-6">
                  {{ book.borrows }} lượt mượn
                </span>
              </div>
            </div>

            <div class="card-body d-flex flex-column p-3">
              <h6 class="fw-bold line-clamp-3 mb-2">{{ book.title }}</h6>
              <p class="text-muted small flex-grow-1">{{ book.author }}</p>
              <div
                class="d-flex justify-content-between align-items-center mt-2"
              >
                <small class="text-success fw-medium">
                  {{ book.borrows }} lần mượn
                </small>
                <small class="text-primary fw-medium">
                  {{ Number(book.price).toLocaleString("vi-VN") }}đ
                </small>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  books: Array,
  loading: Boolean,
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
  text-overflow: ellipsis;
}
</style>