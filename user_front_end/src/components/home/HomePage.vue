<template>
  <div>
    <!-- Hero Section -->
    <HeroSection />

    <!-- Thống kê nhanh -->
    <StatsSection :stats="homeStats" />

    <!-- Sách được mượn nhiều nhất -->
    <TopBorrowedBooks :books="topBorrowedBooks" :loading="loading" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import HeroSection from "@/components/home/HeroSection.vue";
import StatsSection from "@/components/home/StatsSection.vue";
import TopBorrowedBooks from "@/components/home/TopBorrowedBooks.vue";
import SachService from "@/services/book.service";
import CategoryService from "@/services/category.service";
import AuthorService from "@/services/author.service";
import ReaderService from "@/services/reader.service";
import PhieuMuonService from "@/services/borrow.service";

// Dữ liệu thống kê nhanh
const homeStats = ref({
  totalBooks: 0,
  totalReaders: 0,
  totalCategories: 0,
  totalAuthors: 0,
});

// Top sách được mượn nhiều nhất
const topBorrowedBooks = ref([]);
const loading = ref(true);

const fetchHomeData = async () => {
  try {
    loading.value = true;

    // 1. Lấy tổng sách + độc giả + phiếu mượn
    const [sach, docgia, theloai, tacgia] = await Promise.all([
      SachService.getAll({ limit: 1 }),
      ReaderService.getAll({ limit: 9000 }),
      CategoryService.getAll(),
      AuthorService.getAll(),
    ]);

    homeStats.value = {
      totalBooks: sach.pagination?.total || 0,
      totalReaders: docgia.pagination?.total || 0,
      totalCategories: theloai.length || 0,
      totalAuthors: tacgia.length || 0,
    };

    // 2. Lấy top sách được mượn nhiều nhất (tất cả phiếu mượn, không phân biệt trạng thái)
    const phieuRes = await PhieuMuonService.getAll({ limit: 9999 });

    const phieuList = Array.isArray(phieuRes) ? phieuRes : phieuRes.data || [];

    // Đếm số lần tương tác của từng sách
    const borrowCount = {};
    phieuList.forEach((p) => {
      if (p.Sach_id) {
        const id = p.Sach_id.toString();
        borrowCount[id] = (borrowCount[id] || 0) + 1;
      }
    });

    // Lấy top 8 sách mượn nhiều nhất
    const topIds = Object.keys(borrowCount)
      .sort((a, b) => borrowCount[b] - borrowCount[a])
      .slice(0, 16);

    if (topIds.length === 0) {
      topBorrowedBooks.value = [];
      loading.value = false;
      return;
    }

    // Lấy thông tin chi tiết từng sách
    const books = await Promise.all(
      topIds.map(async (id) => {
        try {
          const sach = await SachService.get(id);
          return {
            id: sach._id,
            title: sach.TenSach,
            author: sach.TenTacGia || "Không rõ tác giả",
            cover: sach.Anh
              ? `http://localhost:3000${sach.Anh}`
              : "/images/no-book.jpg",
            borrows: borrowCount[id],
            price: sach.DonGia || 0,
          };
        } catch {
          return null;
        }
      })
    );

    topBorrowedBooks.value = books.filter(Boolean);
    console.log(topBorrowedBooks.value);
  } catch (err) {
    console.error("Lỗi tải trang chủ:", err);
    topBorrowedBooks.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchHomeData();
});
</script>