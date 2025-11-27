<template>
  <div class="py-5 bg-light min-vh-100">
    <div class="container">
      <div
        class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3"
      >
        <div class="d-flex align-items-center">
          <h2 class="mb-0 fw-bold text-primary">Lịch sử mượn sách</h2>
          <span class="badge bg-primary fs-6 ms-3"
            >{{ filteredBorrows.length }} phiếu</span
          >
        </div>

        <!-- Nút làm mới -->
        <button @click="loadData" class="btn btn-outline-secondary btn-sm">
          <i class="bi bi-arrow-clockwise"></i> Làm mới
        </button>
      </div>

      <!-- Bộ lọc -->
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <div class="row g-3">
            <!-- Tìm theo tên sách -->
            <div class="col-md-4">
              <input
                type="text"
                v-model="filters.keyword"
                @input="applyFilters"
                class="form-control"
                placeholder="Tìm tên sách..."
              />
            </div>

            <!-- Lọc thể loại -->
            <div class="col-md-3">
              <select
                v-model="filters.theloai"
                @change="applyFilters"
                class="form-select"
              >
                <option value="">Tất cả thể loại</option>
                <option v-for="tl in theloaiList" :key="tl" :value="tl">
                  {{ tl }}
                </option>
              </select>
            </div>

            <!-- Lọc tác giả -->
            <div class="col-md-3">
              <select
                v-model="filters.tacgia"
                @change="applyFilters"
                class="form-select"
              >
                <option value="">Tất cả tác giả</option>
                <option v-for="tg in tacgiaList" :key="tg" :value="tg">
                  {{ tg }}
                </option>
              </select>
            </div>

            <!-- Khoảng thời gian -->
            <div class="col-md-2">
              <select
                v-model="filters.timeRange"
                @change="applyFilters"
                class="form-select"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="3months">3 tháng gần đây</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-5">
        <div
          class="spinner-border text-primary"
          style="width: 3rem; height: 3rem"
        ></div>
      </div>

      <!-- Không có kết quả -->
      <div
        v-else-if="!loading && filteredBorrows.length === 0"
        class="text-center py-5"
      >
        <h5 class="text-muted">Không tìm thấy phiếu mượn nào</h5>
      </div>

      <!-- Danh sách phiếu mượn -->
      <div v-else class="row g-4">
        <div
          v-for="item in filteredBorrows"
          :key="item._id"
          class="col-lg-6 col-xxl-4"
        >
          <router-link
            :to="{ name: 'borrow.detail', params: { id: item._id } }"
          >
            <div class="card border-0 shadow-sm h-100 hover-card">
              <div class="row g-0">
                <div class="col-4">
                  <img
                    :src="baseUrl + item.sach.Anh"
                    class="img-fluid rounded-start h-100 w-100"
                    style="object-fit: cover"
                    :alt="item.sach.TenSach"
                  />
                </div>
                <div class="col-8">
                  <div class="card-body d-flex flex-column h-100 py-3">
                    <h6 class="fw-bold text-primary mb-1 line-clamp-2 fs-4">
                      {{ item.sach.TenSach }}
                    </h6>

                    <div class="small text-muted mb-2 fs-6">
                      <div>
                        <strong>Tác giả:</strong>
                        {{ item.sach.TacGia || "Không rõ" }}
                      </div>
                      <div>
                        <strong>Thể loại:</strong>
                        {{ item.sach.TheLoai || "Không rõ" }}
                      </div>
                    </div>

                    <div class="mt-auto">
                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <small class="text-muted">Ngày mượn</small>
                        <strong class="small">{{
                          formatShortDate(item.NgayMuon)
                        }}</strong>
                      </div>

                      <div
                        class="d-flex justify-content-between align-items-center"
                      >
                        <small class="text-muted">Trạng thái</small>
                        <span
                          class="badge rounded-pill px-3 py-2"
                          :class="getStatusClass(item.TrangThai)"
                        >
                          {{ getStatusText(item.TrangThai) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import BorrowService from "@/services/borrow.service";
import Swal from "sweetalert2";

const borrows = ref([]);
const loading = ref(true);
const baseUrl = import.meta.env.VITE_BACKEND_URL || "";

const filters = ref({
  keyword: "",
  theloai: "",
  tacgia: "",
  timeRange: "all",
});

// Lấy danh sách thể loại & tác giả từ dữ liệu
const theloaiList = computed(() => {
  const set = new Set(borrows.value.map((b) => b.sach.TheLoai).filter(Boolean));
  return [...set].sort();
});

const tacgiaList = computed(() => {
  const set = new Set(borrows.value.map((b) => b.sach.TacGia).filter(Boolean));
  return [...set].sort();
});

// Lọc dữ liệu theo bộ lọc
const filteredBorrows = computed(() => {
  let result = [...borrows.value];

  // Lọc tên sách
  if (filters.value.keyword) {
    const kw = filters.value.keyword.toLowerCase();
    result = result.filter((item) =>
      item.sach.TenSach.toLowerCase().includes(kw)
    );
  }

  // Lọc thể loại
  if (filters.value.theloai) {
    result = result.filter(
      (item) => item.sach.TheLoai === filters.value.theloai
    );
  }

  // Lọc tác giả
  if (filters.value.tacgia) {
    result = result.filter((item) => item.sach.TacGia === filters.value.tacgia);
  }

  // Lọc thời gian
  if (filters.value.timeRange !== "all") {
    const now = new Date();
    let days = 0;
    if (filters.value.timeRange === "week") days = 7;
    if (filters.value.timeRange === "month") days = 30;
    if (filters.value.timeRange === "3months") days = 90;

    const cutoff = new Date(now.setDate(now.getDate() - days));
    result = result.filter((item) => new Date(item.NgayMuon) >= cutoff);
  }

  return result;
});

const loadData = async () => {
  loading.value = true;
  try {
    const res = await BorrowService.getMyBorrows();
    borrows.value = res.data || [];
  } catch (err) {
    Swal.fire("Lỗi", "Không thể tải lịch sử mượn sách", "error");
  } finally {
    loading.value = false;
  }
};

const applyFilters = () => {
  // computed sẽ tự động cập nhật filteredBorrows
};

const formatShortDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusText = (status) => {
  const map = {
    "Chờ duyệt": "Chờ duyệt",
    "Đang mượn": "Đang mượn",
    "Đã trả": "Đã trả",
    "Đã hủy": "Đã hủy",
    "Từ chối": "Từ chối",
  };
  return map[status] || status;
};

const getStatusClass = (status) => {
  const classes = {
    "Chờ duyệt": "bg-warning text-dark",
    "Đang mượn": "bg-success text-white",
    "Đã trả": "bg-secondary text-white",
    "Đã hủy": "bg-danger text-white",
    "Từ chối": "bg-danger text-white",
  };
  return classes[status] || "bg-light text-dark";
};

onMounted(loadData);
</script>

<style scoped>
.hover-card:hover {
  transform: translateY(-4px);
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12) !important;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>