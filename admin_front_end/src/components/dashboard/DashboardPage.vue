<template>
  <main class="app-main p-0" style="min-height: 100vh">
    <div class="container-fluid py-4 px-5">
      <h2 class="text-center fw-bolder mb-5">Thống kê hệ thống thư viện</h2>

      <!-- 4 Ô lớn thống kê chính -->
      <div class="row g-4 mb-5">
        <div class="col-lg-3 col-md-6">
          <div
            class="card border-0 shadow-sm h-100 bg-gradient-primary text-white"
          >
            <div class="card-body d-flex align-items-center">
              <div class="me-4">
                <i class="fas fa-book fa-3x opacity-75"></i>
              </div>
              <div>
                <h5 class="mb-1">Tổng số sách</h5>
                <h3 class="fw-bold mb-0">{{ stats.totalBooks }}</h3>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div
            class="card border-0 shadow-sm h-100 bg-gradient-success text-white"
          >
            <div class="card-body d-flex align-items-center">
              <div class="me-4">
                <i class="fas fa-users fa-3x opacity-75"></i>
              </div>
              <div>
                <h5 class="mb-1">Tổng độc giả</h5>
                <h3 class="fw-bold mb-0">{{ stats.totalReaders }}</h3>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div
            class="card border-0 shadow-sm h-100 bg-gradient-warning text-white"
          >
            <div class="card-body d-flex align-items-center">
              <div class="me-4">
                <i class="fas fa-clipboard-list fa-3x opacity-75"></i>
              </div>
              <div>
                <h5 class="mb-1">Đang mượn</h5>
                <h3 class="fw-bold mb-0">{{ stats["Đang mượn"] }}</h3>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-3 col-md-6">
          <div
            class="card border-0 shadow-sm h-100 bg-gradient-info text-white"
          >
            <div class="card-body d-flex align-items-center">
              <div class="me-4">
                <i class="fas fa-clock fa-3x opacity-75"></i>
              </div>
              <div>
                <h5 class="mb-1">Chờ duyệt</h5>
                <h3 class="fw-bold mb-0">{{ stats["Chờ duyệt"] }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top 5 sách đang được mượn nhiều nhất -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-header bg-primary text-white fw-bold">
          Top sách đang được mượn nhiều nhất
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-border">
                <tr>
                  <th width="80">Ảnh</th>
                  <th>Tên sách</th>
                  <th>Tác giả</th>
                  <th class="text-center">Số lượng</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="sach in stats.topBooks" :key="sach._id">
                  <td>
                    <img
                      :src="baseUrl + sach.Anh"
                      class="rounded shadow-sm"
                      width="60"
                      height="80"
                      style="object-fit: cover"
                    />
                  </td>
                  <td class="fw-bold">{{ sach.TenSach }}</td>
                  <td>{{ sach.TenTacGia || "—" }}</td>
                  <td class="text-center">
                    <span class="badge bg-success fs-6">{{
                      sach.soLanDangMuon
                    }}</span>
                  </td>
                </tr>
                <tr v-if="!stats.topBooks || stats.topBooks.length === 0">
                  <td colspan="5" class="text-center text-muted py-5">
                    <i class="fas fa-book-open fa-2x mb-3 d-block"></i>
                    Chưa có phiếu mượn nào
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Thống kê trạng thái + hôm nay -->
      <div class="row">
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-dark text-white fw-bold">
              Trạng thái phiếu mượn
            </div>
            <div class="card-body">
              <div class="row text-center">
                <div
                  class="col-md-4 mb-3"
                  v-for="(value, key) in trangThaiList"
                  :key="key"
                >
                  <div class="p-3 border rounded">
                    <small class="d-block text-muted">{{ key }}</small>
                    <h4 class="fw-bold text-primary mb-0">{{ value }}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-dark text-white fw-bold">
              Hoạt động hôm nay
            </div>
            <div class="card-body text-center py-5">
              <h5 class="text-muted">Phiếu mượn mới</h5>
              <h2 class="fw-bold text-success">{{ stats.homNay }}</h2>
              <small class="text-muted">Cập nhật: {{ currentTime }}</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import SachService from "@/services/book.service";
import ReaderService from "@/services/reader.service";
import PhieuMuonService from "@/services/borrow.service";

const stats = ref({
  totalBooks: 0,
  totalReaders: 0,
  "Chờ duyệt": 0,
  "Đang mượn": 0,
  "Đã trả": 0,
  "Đã hủy": 0,
  "Từ chối": 0,
  homNay: 0,
  topBooks: [],
});

const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const currentTime = ref("");

const trangThaiList = computed(() => ({
  "Chờ duyệt": stats.value["Chờ duyệt"],
  "Đang mượn": stats.value["Đang mượn"],
  "Đã trả": stats.value["Đã trả"],
  "Đã hủy": stats.value["Đã hủy"],
  "Từ chối": stats.value["Từ chối"],
}));

const fetchStats = async () => {
  try {
    const [booksRes, readersRes, borrowStats] = await Promise.all([
      SachService.getAll({ limit: 1 }),
      ReaderService.getAll({ limit: 1 }),
      PhieuMuonService.getBorrowStats(),
    ]);

    stats.value.totalBooks = booksRes.pagination?.total || 0;
    stats.value.totalReaders = readersRes.pagination?.total || 0;
    Object.assign(stats.value, borrowStats);

    await fetchTopBooks();
    currentTime.value = new Date().toLocaleTimeString("vi-VN");
  } catch (err) {
    console.error("Lỗi tải thống kê:", err);
  }
};

const fetchTopBooks = async () => {
  try {
    const res =
      (await PhieuMuonService.getAllWithoutPagination?.()) ||
      (await PhieuMuonService.getAll({ limit: 9999 }));
    const phieuList = Array.isArray(res) ? res : res.data || [];

    console.log(phieuList);
    const borrowCount = {};
    phieuList.forEach((p) => {
      if (
        ["Đang mượn", "Chờ duyệt", "Đã trả"].includes(p.TrangThai) &&
        p.Sach_id
      ) {
        const id = p.Sach_id.toString();
        borrowCount[id] = (borrowCount[id] || 0) + 1;
      }
    });

    console.log(borrowCount);

    const topIds = Object.keys(borrowCount)
      .sort((a, b) => borrowCount[b] - borrowCount[a])
      .slice(0, 5);

    if (topIds.length === 0) {
      stats.value.topBooks = [];
      return;
    }

    const books = await Promise.all(
      topIds.map(async (id) => {
        try {
          const sach = await SachService.get(id);
          const dangMuon = borrowCount[id];
          return {
            ...sach,
            soLanDangMuon: dangMuon,
            SoLuongConLai: (sach.SoLuong || 0) - dangMuon,
          };
        } catch {
          return null;
        }
      })
    );

    stats.value.topBooks = books.filter(Boolean);
  } catch (err) {
    stats.value.topBooks = [];
  }
};

let interval;
onMounted(() => {
  fetchStats();
  interval = setInterval(fetchStats, 30000);
});

onUnmounted(() => {
  clearInterval(interval);
});
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
  border-radius: 15px;
  transition: all 0.3s;
}
.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15) !important;
}
</style>