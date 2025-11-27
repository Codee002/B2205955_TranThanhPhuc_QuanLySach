<!-- src/components/book/detail/RelatedBooks.vue -->
<script setup>
import { ref, watch } from "vue";
import BookService from "@/services/book.service";

const props = defineProps({
  categoryId: String,
  excludeId: String,
  limit: { type: Number, default: 12 },
});

const books = ref([]);
const loading = ref(true);

const baseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";
const getCover = (anh) => (anh ? `${baseUrl}${anh}` : "/images/no-image.jpg");

watch(
  () => props.categoryId,
  async (newId) => {
    if (!newId) {
      books.value = [];
      loading.value = false;
      return;
    }
    loading.value = true;
    try {
      const res = await BookService.getAll(1, props.limit + 1, "", "on", newId);
      books.value = res.data
        .filter((b) => b._id !== props.excludeId)
        .slice(0, props.limit);
    } catch (err) {
      books.value = [];
    } finally {
      loading.value = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="mt-5">
    <h4 class="fw-bold text-primary mb-4">Sách cùng thể loại</h4>

    <div v-if="loading" class="text-center py-4">
      <div class="spinner-border text-primary"></div>
    </div>
    <div v-else-if="books.length === 0" class="text-muted text-center py-4">
      Chưa có sách khác
    </div>

    <div v-else class="row g-4">
      <div v-for="b in books" :key="b._id" class="col-6 col-md-4 col-lg-3">
        <router-link :to="`/book/${b._id}`" class="text-decoration-none">
          <div class="card h-100 shadow-sm hover-shadow border-0">
            <img
              :src="getCover(b.Anh)"
              class="card-img-top"
              style="height: 220px; object-fit: cover"
            />
            <div class="card-body p-3">
              <h6 class="text-dark mb-1 text-truncate-2">{{ b.TenSach }}</h6>
              <small class="text-muted">{{ b.TenTacGia }}</small>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>