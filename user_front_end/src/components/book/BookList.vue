<template>
  <div class="py-5">
    <div class="container">
      <!-- Tiêu đề + số kết quả -->
      <div class="text-center mb-5">
        <h2 class="h3 fw-bold text-primary">Tất Cả Sách</h2>

        <p v-if="totalItems > 0" class="text-muted">
          Tìm thấy <strong>{{ totalItems }}</strong> cuốn sách
        </p>
      </div>
      <!-- Thêm ngay sau dòng <h2 class="h3 fw-bold text-primary">Tất Cả Sách</h2> -->
      <div class="row justify-content-center mb-4">
        <div class="col-lg-6 col-md-8 col-12">
          <div class="position-relative">
            <input
              type="text"
              v-model="localKeyword"
              @keyup.enter="applyLocalSearch"
              class="form-control form-control-lg ps-5 shadow-sm"
              placeholder="Tìm tên sách, tác giả..."
              style="height: 52px"
            />
          </div>
        </div>
      </div>
      <!-- 3 ô lọc + nút xóa -->
      <div class="row g-3 justify-content-center mb-5">
        <div class="col-md-3 col-12">
          <select
            v-model="filters.theLoai"
            @change="resetPageAndFetch"
            class="form-select form-select-lg"
          >
            <option value="">Tất cả thể loại</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <div class="col-md-3 col-12">
          <select
            v-model="filters.tacGia"
            @change="resetPageAndFetch"
            class="form-select form-select-lg"
          >
            <option value="">Tất cả tác giả</option>
            <option v-for="author in authors" :key="author" :value="author">
              {{ author }}
            </option>
          </select>
        </div>

        <div class="col-md-3 col-12">
          <select
            v-model="filters.nxb"
            @change="resetPageAndFetch"
            class="form-select form-select-lg"
          >
            <option value="">Tất cả nhà xuất bản</option>
            <option v-for="pub in publishers" :key="pub" :value="pub">
              {{ pub }}
            </option>
          </select>
        </div>

        <div class="col-md-2 col-12">
          <button
            @click="clearFilters"
            class="btn btn-outline-secondary btn-lg w-100"
          >
            Xóa lọc
          </button>
        </div>
      </div>

      <!-- Danh sách sách -->
      <div class="row g-5 justify-content-center">
        <div
          v-for="book in books"
          :key="book._id"
          class="col-6 col-sm-4 col-md-4 col-lg-3 col-xl-2dot4"
        >
          <BookCard :book="book" />
        </div>
      </div>

      <!-- Không có kết quả -->
      <div v-if="books.length === 0 && !loading" class="text-center py-5">
        <h5 class="text-muted">Không tìm thấy sách nào phù hợp</h5>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div
          class="spinner-border text-primary"
          style="width: 3rem; height: 3rem"
        ></div>
      </div>

      <!-- Phân trang -->
      <nav v-if="totalPages > 1" class="mt-5">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <button class="page-link" @click="goToPage(currentPage - 1)">
              Trước
            </button>
          </li>
          <li
            v-for="page in visiblePages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <button class="page-link" @click="goToPage(page)">
              {{ page }}
            </button>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages }"
          >
            <button class="page-link" @click="goToPage(currentPage + 1)">
              Sau
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router"; // ← ĐÃ THÊM useRouter
import BookCard from "./BookCard.vue";
import BookService from "@/services/book.service";

const route = useRoute();
const router = useRouter();

const books = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);

const filters = ref({ theLoai: "", tacGia: "", nxb: "" });
const theLoaiMap = ref({});
const tacGiaMap = ref({});
const nxbMap = ref({});

const localKeyword = ref("");

// === TÌM KIẾM TẠI CHỖ – ĐÃ SỬA ===
const applyLocalSearch = () => {
  const q = localKeyword.value.trim();
  if (q) {
    router.push({
      path: "/book",
      query: { ...route.query, q, page: undefined }, // về trang 1
    });
  } else {
    const { q, page, ...rest } = route.query;
    router.push({ query: rest });
  }
};

const categories = ref([]);
const authors = ref([]);
const publishers = ref([]);

const loadFilterOptions = async () => {
  try {
    const result = await BookService.getAll(1, 1000, "", "on");
    const allBooks = result.data || [];

    theLoaiMap.value = {};
    tacGiaMap.value = {};
    nxbMap.value = {};

    allBooks.forEach((book) => {
      if (book.TheLoai && book.TheLoai_id)
        theLoaiMap.value[book.TheLoai] = book.TheLoai_id;
      if (book.TenTacGia && book.TacGia_id)
        tacGiaMap.value[book.TenTacGia] = book.TacGia_id;
      if (book.TenNXB && book.NhaXuatBan_id)
        nxbMap.value[book.TenNXB] = book.NhaXuatBan_id;
    });

    categories.value = Object.keys(theLoaiMap.value).sort();
    authors.value = Object.keys(tacGiaMap.value).sort();
    publishers.value = Object.keys(nxbMap.value).sort();
  } catch (err) {
    console.log("Không load được bộ lọc");
  }
};

const goToPage = async (page) => {
  await fetchBooks(page);
  window.scrollTo({
    top: 0,
  });
};

const fetchBooks = async (page = 1) => {
  loading.value = true;
  try {
    const keyword = (route.query.q || "").toString().trim();

    const result = await BookService.getAll(
      page,
      15,
      keyword,
      "on",
      theLoaiMap.value[filters.value.theLoai] || "",
      tacGiaMap.value[filters.value.tacGia] || "",
      nxbMap.value[filters.value.nxb] || ""
    );

    books.value = result.data || [];
    totalItems.value = result.pagination.total;
    totalPages.value = result.pagination.totalPages;
    currentPage.value = result.pagination.page || 1;
  } catch (err) {
    console.error("Lỗi:", err);
    books.value = [];
  } finally {
    loading.value = false;
  }
};

const resetPageAndFetch = () => {
  currentPage.value = 1;
  fetchBooks(1);
};

const clearFilters = () => {
  filters.value = { theLoai: "", tacGia: "", nxb: "" };
  resetPageAndFetch();
};

const visiblePages = computed(() => {
  const max = 7;
  let start = Math.max(1, currentPage.value - 3);
  let end = Math.min(totalPages.value, start + max - 1);
  if (end - start + 1 < max) start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

// Watch query.q → refetch + điền lại ô input
watch(
  () => route.query.q,
  () => {
    localKeyword.value = (route.query.q || "").toString();
    currentPage.value = 1;
    fetchBooks(1);
  },
  { immediate: true }
);

onMounted(() => {
  loadFilterOptions();
  fetchBooks();
});
</script>
<style scoped>
.col-xl-2dot4 {
  flex: 0 0 19.5%;
  max-width: 19.5%;
}
@media (max-width: 1200px) {
  .col-xl-2dot4 {
    flex: 0 0 24%;
    max-width: 24%;
  }
}
@media (max-width: 768px) {
  .col-xl-2dot4 {
    flex: 0 0 32%;
    max-width: 32%;
  }
}
@media (max-width: 576px) {
  .col-xl-2dot4 {
    flex: 0 0 48%;
    max-width: 48%;
  }
}
</style>