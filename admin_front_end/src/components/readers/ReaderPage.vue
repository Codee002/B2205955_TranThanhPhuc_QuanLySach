<template>
  <main class="app-main p-0" style="height: 100%">
    <div class="container-fluid py-4">
      <h2 class="text-center fw-bolder mb-4">Quản lý độc giả</h2>

      <div class="row mb-4 align-items-center">
        <div class="col-lg-8">
          <div class="d-flex gap-2 flex-wrap">
            <input
              type="text"
              v-model="searchKeyword"
              @keyup.enter="fetchReaders(1)"
              placeholder="Tìm theo tên, mã, sđt..."
              class="form-control"
              style="max-width: 350px"
            />
            <!-- <select
              v-model="statusFilter"
              @change="fetchReaders(1)"
              class="form-select"
              style="width: auto"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Bị khóa</option>
            </select> -->
            <button @click="fetchReaders(1)" class="btn btn-primary">
              <i class="fas fa-search me-1"></i> Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered align-middle table-hover">
          <thead class="table-dark">
            <tr>
              <th width="120">Ảnh</th>
              <th>Mã độc giả</th>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Địa chỉ</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="reader in readers" :key="reader._id">
              <td class="text-center">
                <div
                  v-if="reader.Anh"
                  class="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto overflow-hidden"
                  style="width: 50px; height: 50px; border: 2px solid #e9ecef"
                >
                  <img
                    :src="`http://localhost:3000${reader.Anh}`"
                    alt="Avatar"
                    style="width: 100%; height: 100%; object-fit: cover"
                  />
                </div>

                <div
                  v-else
                  class="bg-light rounded-circle d-flex align-items-center justify-content-center mx-auto"
                  style="
                    width: 50px;
                    height: 50px;
                    font-size: 1.5rem;
                    color: #6c757d;
                  "
                >
                  {{ reader.HoTen.charAt(0).toUpperCase() }}
                </div>
              </td>
              <td class="">
                #{{ reader._id.toString().slice(-6).toUpperCase() }}
              </td>

              <td class="word-break" style="max-width: 160px">
                {{ reader.HoTen }}
              </td>
              <td>{{ reader.SoDienThoai || "—" }}</td>
              <td>{{ reader.DiaChi || "—" }}</td>

              <td>
                <button
                  @click="toggleStatus(reader._id, reader.TrangThai)"
                  class="btn btn-sm"
                  :class="
                    reader.TrangThai === 'active' ? 'btn-success' : 'btn-danger'
                  "
                >
                  {{ reader.TrangThai === "active" ? "Hoạt động" : "Bị khóa" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="readers.length === 0" class="text-center py-5 text-muted">
          <i class="fas fa-users fa-3x mb-3"></i>
          <h5>Không có độc giả nào</h5>
        </div>
      </div>

      <!-- Phân trang -->
      <nav v-if="totalPages > 1" class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a
              class="page-link"
              href="#"
              @click.prevent="fetchReaders(currentPage - 1)"
              >Trước</a
            >
          </li>
          <li
            v-for="page in visiblePages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <a class="page-link" href="#" @click.prevent="fetchReaders(page)">
              {{ page }}
            </a>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages }"
          >
            <a
              class="page-link"
              href="#"
              @click.prevent="fetchReaders(currentPage + 1)"
              >Sau</a
            >
          </li>
        </ul>
        <div class="text-center text-muted small">
          Trang {{ currentPage }} / {{ totalPages }} (Tổng: {{ totalItems }} độc
          giả)
        </div>
      </nav>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import ReaderService from "@/services/reader.service";

const readers = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const searchKeyword = ref("");
const statusFilter = ref("");

const router = useRouter();

const fetchReaders = async (page = 1) => {
  try {
    currentPage.value = page;
    const response = await ReaderService.getAll({
      page,
      limit: 10,
      keyword: searchKeyword.value.trim(),
      trangthai: statusFilter.value || undefined,
    });

    console.log(statusFilter.value);
    readers.value = response.data || [];
    totalItems.value = response.pagination.total;
    totalPages.value = response.pagination.totalPages;
  } catch (err) {
    console.error("Lỗi tải độc giả:", err);
    readers.value = [];
    await Swal.fire({
      title: "Lỗi",
      text: err.response?.data?.message || "Có lỗi xảy ra",
      icon: "error",
      theme: "dark",
    });
  }
};

const visiblePages = computed(() => {
  const pages = [];
  const max = 7;
  let start = Math.max(1, currentPage.value - 2);
  let end = Math.min(totalPages.value, start + max - 1);
  if (end - start + 1 < max) start = Math.max(1, end - max + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const toggleStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === "active" ? "inactive" : "active";

  const result = await Swal.fire({
    title: "Đổi trạng thái?",
    text: `Độc giả sẽ được ${newStatus === "active" ? "mở khóa" : "khóa lại"}`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
    theme: "dark",
  });

  if (result.isConfirmed) {
    try {
      await ReaderService.toggleStatus(id, { TrangThai: newStatus });
      const reader = readers.value.find((r) => r._id === id);
      if (reader) reader.TrangThai = newStatus;
      await Swal.fire({
        title: "Thành công!",
        text: "Trạng thái đã được cập nhật",
        icon: "success",
        theme: "dark",
      });
    } catch (err) {
      console.log(err);
      await Swal.fire({
        title: "Lỗi",
        text: err.response?.data?.message || "Có lỗi xảy ra",
        icon: "error",
        theme: "dark",
      });
    }
  }
};

onMounted(() => {
  fetchReaders();
});
</script>

<style scoped>
.word-break {
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
}
.table-hover tbody tr:hover {
  background-color: #f8f9fa;
}
.badge {
  font-size: 0.9rem;
  min-width: 36px;
}
</style>