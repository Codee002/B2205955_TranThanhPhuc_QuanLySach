<template>
  <main class="app-main p-0" style="height: 100%">
    <div class="container" style="width: 90%">
      <h2 class="text-center fw-bolder mt-4 mb-4">Quản lý phiếu mượn</h2>

      <!-- Search & Filter -->
      <div class="d-flex align-items-center mb-3 gap-2 flex-wrap">
        <input
          type="text"
          placeholder="Tìm kiếm tên sách, tên độc giả..."
          class="form-control"
          style="max-width: 300px"
          v-model="searchKeyword"
        />
        <select class="form-select" style="width: auto" v-model="statusFilter">
          <option value="">Tất cả trạng thái</option>
          <option value="Chờ duyệt">Chờ duyệt</option>
          <option value="Đang mượn">Đang mượn</option>
          <option value="Đã trả">Đã trả</option>
          <option value="Đã hủy">Đã hủy</option>
          <option value="Từ chối">Từ chối</option>
        </select>
        <select class="form-select" style="width: auto" v-model="overDueFilter">
          <option value="">Quá hạn</option>
          <option value="1">Có</option>
          <option value="0">Không</option>
        </select>
        <button @click="loadBorrows(1)" class="btn btn-primary">
          <i class="fas fa-search"></i> Tìm
        </button>
        <div class="ms-auto">
          <button @click="loadBorrows(1)" class="btn btn-outline-secondary">
            <i class="fas fa-sync"></i> Làm mới
          </button>
        </div>
      </div>

      <!-- Table - Gọn nhẹ -->
      <div class="table-responsive">
        <table class="table table-bordered">
          <thead class="">
            <tr>
              <th width="100">Mã phiếu</th>
              <th>Sách</th>
              <th width="110">Người mượn</th>
              <th width="110">Ngày mượn</th>
              <th width="130">Trạng thái</th>
              <th width="180" class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody v-if="borrows.length > 0">
            <tr v-for="item in borrows" :key="item._id">
              <!-- Mã phiếu -->
              <td class="fw-bold small">
                #{{ item._id.toString().slice(-6).toUpperCase() }}
              </td>

              <!-- Ảnh + Tên sách -->
              <td>
                <div class="d-flex align-items-center">
                  <img
                    :src="baseUrl + item.sach.Anh"
                    width="40"
                    height="56"
                    class="rounded me-3"
                    style="object-fit: cover"
                  />
                  <div>
                    <div class="fw-bold">{{ item.sach.TenSach }}</div>
                    <small class="text-muted">{{ item.sach.TacGia }}</small>
                  </div>
                </div>
              </td>

              <!-- Người mượn -->
              <td>
                <div class="fw-bold">{{ item.docGia.HoTen }}</div>
              </td>

              <!-- Ngày mượn -->
              <td class="small text-center">
                {{ formatDate(item.NgayMuon) }}
                <br v-if="item.NgayDuyet" />
              </td>

              <!-- Trạng thái -->
              <td class="text-center">
                <span
                  class="badge px-3 py-2 fw-bold"
                  :class="getStatusClass(item.TrangThai)"
                >
                  {{ item.TrangThai }}
                </span>
              </td>

              <!-- Hành động -->
              <td class="text-center">
                <!-- Duyệt -->
                <button
                  v-if="item.TrangThai === 'Chờ duyệt'"
                  @click="approve(item._id)"
                  class="btn btn-success me-1"
                  title="Duyệt phiếu"
                >
                  <i class="fas fa-check"></i>
                </button>

                <!-- Từ chối / Hủy -->
                <button
                  v-if="item.TrangThai === 'Chờ duyệt'"
                  @click="reject(item._id)"
                  class="btn btn-danger me-1"
                  title="Từ chối"
                >
                  <i class="fas fa-times"></i>
                </button>

                <!-- Nhận trả sách -->
                <button
                  v-if="item.TrangThai === 'Đang mượn'"
                  @click="returnBook(item)"
                  class="btn btn-primary me-1"
                  title="Xác nhận trả sách"
                >
                  <i class="fas fa-undo"></i>
                </button>

                <!-- Chi tiết -->
                <router-link
                  class="me-2"
                  :to="{ name: 'borrow.detail', params: { id: item._id } }"
                >
                  <button class="btn btn-primary">
                    <i class="fa-solid fa-circle-info"></i>
                  </button>
                </router-link>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td colspan="7" class="text-center py-5 text-muted">
                <h5>Không có phiếu mượn nào</h5>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <nav v-if="pagination.totalPages > 1" class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: pagination.page === 1 }">
            <a
              class="page-link"
              href="#"
              @click.prevent="loadBorrows(pagination.page - 1)"
              >Trước</a
            >
          </li>
          <li
            v-for="page in visiblePages"
            :key="page"
            class="page-item"
            :class="{ active: pagination.page === page }"
          >
            <a class="page-link" href="#" @click.prevent="loadBorrows(page)">{{
              page
            }}</a>
          </li>
          <li
            class="page-item"
            :class="{ disabled: pagination.page === pagination.totalPages }"
          >
            <a
              class="page-link"
              href="#"
              @click.prevent="loadBorrows(pagination.page + 1)"
              >Sau</a
            >
          </li>
        </ul>
        <div class="text-center text-muted small mt-2">
          Trang {{ pagination.page }} / {{ pagination.totalPages }} • Tổng
          {{ pagination.total }} phiếu mượn
        </div>
      </nav>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import BorrowService from "@/services/borrow.service";
import Swal from "sweetalert2";

const borrows = ref([]);
const pagination = ref({
  total: 0,
  page: 1,
  totalPages: 1,
});
const searchKeyword = ref("");
const statusFilter = ref("");
const overDueFilter = ref("");
const baseUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Tự động tìm kiếm khi gõ hoặc đổi filter
watch(
  [searchKeyword, statusFilter, overDueFilter],
  () => {
    loadBorrows(1);
  },
  { debounce: 400 }
);

// Tải danh sách (giữ nguyên)
const loadBorrows = async (page = 1) => {
  try {
    const response = await BorrowService.getAll({
      page,
      limit: 10,
      keyword: searchKeyword.value,
      status: statusFilter.value,
      overDue: overDueFilter.value,
    });

    borrows.value = response.data;
    console.log(borrows.value);
    pagination.value = {
      total: response.total,
      page: response.page,
      totalPages: response.totalPages,
    };
    console.log(pagination.value);
  } catch (error) {
    console.error(error);
    await Swal.fire({
      title: "Lỗi",
      text: err.response?.data?.message || "Có lỗi xảy ra",
      icon: "error",
      theme: "dark",
    });
  }
};

// CẬP NHẬT NGAY LẬP TỨC - KHÔNG RELOAD TOÀN TRANG
const updateBorrowInList = (updatedBorrow) => {
  const index = borrows.value.findIndex((b) => b._id === updatedBorrow._id);
  if (index !== -1) {
    borrows.value[index] = updatedBorrow;
  }
};

const approve = async (id) => {
  const { isConfirmed } = await Swal.fire({
    title: "Duyệt phiếu mượn?",
    text: "Độc giả sẽ được mượn sách trong 7 ngày",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Duyệt ngay",
    theme: "dark",
  });

  if (isConfirmed) {
    try {
      const res = await BorrowService.approve(id);
      const updated = res.data || res;

      updateBorrowInList(updated);
      Swal.fire({
        title: "Thành công!",
        text: "Phiếu đã được duyệt và có hạn trả 7 ngày",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        theme: "dark",
      });
    } catch (err) {
      await Swal.fire({
        title: "Lỗi",
        text: err.response?.data?.message || "Có lỗi xảy ra",
        icon: "error",
        theme: "dark",
      });
    }
  }
};

const reject = async (id) => {
  const { isConfirmed } = await Swal.fire({
    title: "Từ chối phiếu mượn?",
    text: "Hành động này không thể hoàn tác",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Từ chối",
    confirmButtonColor: "#d33",
    theme: "dark",
  });

  if (isConfirmed) {
    try {
      const res = await BorrowService.reject(id);
      const updated = res.data || res;

      updateBorrowInList(updated);
      Swal.fire({
        title: "Đã từ chối!",
        text: "Phiếu mượn đã bị từ chối",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
        theme: "dark",
      });
    } catch (err) {
      await Swal.fire({
        title: "Lỗi",
        text: err.response?.data?.message || "Có lỗi xảy ra",
        icon: "error",
        theme: "dark",
      });
    }
  }
};

const returnBook = async (item) => {
  const { isConfirmed } = await Swal.fire({
    title: "Xác nhận đã trả sách?",
    text: "Phiếu sẽ chuyển sang trạng thái Đã trả",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Đã trả sách",
    theme: "dark",
  });

  if (isConfirmed) {
    const daysOverdue = computed(() => {
      const hanTra = new Date(item.HanTra);
      const ngayTra = item.NgayTra ? new Date(item.NgayTra) : new Date();

      if (ngayTra <= hanTra) return 0;

      const diffMs = ngayTra - hanTra;

      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      return diffDays;
    });
    try {
      const res = await BorrowService.return(item._id, daysOverdue.value);
      const updated = res.data || res;

      updateBorrowInList(updated);
      Swal.fire({
        title: "Hoàn tất!",
        text: "Sách đã được trả thành công",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        theme: "dark",
      });
    } catch (err) {
      await Swal.fire({
        title: "Lỗi",
        text: err.response?.data?.message || "Có lỗi xảy ra",
        icon: "error",
        theme: "dark",
      });
    }
  }
};

const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString("vi-VN") : "—";

const getStatusClass = (status) => {
  const map = {
    "Chờ duyệt": "bg-warning text-white",
    "Đang mượn": "bg-success text-white",
    "Đã trả": "bg-secondary text-white",
    "Đã hủy": "bg-danger text-white",
    "Từ chối": "bg-danger text-white",
  };
  return map[status] || "bg-light text-dark";
};

const visiblePages = computed(() => {
  const total = pagination.value.totalPages || 1;
  const current = pagination.value.page || 1;
  const delta = 2;
  const pages = [];
  for (
    let i = Math.max(1, current - delta);
    i <= Math.min(total, current + delta);
    i++
  ) {
    pages.push(i);
  }
  return pages;
});

onMounted(() => loadBorrows(1));
</script>
<style scoped>
.table th {
  font-weight: 600;
  font-size: 0.95rem;
}
.badge {
  font-size: 0.85rem;
}
</style>