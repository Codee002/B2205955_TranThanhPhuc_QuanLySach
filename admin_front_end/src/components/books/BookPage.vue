<template>
  <main class="app-main p-0" style="height: 100%">
    <div class="container-fluid py-4">
      <h2 class="text-center fw-bolder mb-4">Quản lý sách</h2>

      <div class="row mb-4 align-items-center">
        <div class="col-lg-8">
          <div class="d-flex gap-2 flex-wrap">
            <input
              type="text"
              v-model="searchKeyword"
              @keyup.enter="fetchSachs(1)"
              placeholder="Nhập tên sách..."
              class="form-control"
              style="max-width: 300px"
            />
            <select
              v-model="statusFilter"
              @change="fetchSachs(1)"
              class="form-select"
              style="width: auto"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="on">Đang hiển thị</option>
              <option value="off">Đã ẩn</option>
            </select>
            <button @click="fetchSachs(1)" class="btn btn-primary">
              Tìm kiếm
            </button>
          </div>
        </div>
        <div class="col-lg-4 text-end">
          <router-link :to="{ name: 'book.create' }">
            <button class="btn btn-success">Thêm sách mới</button>
          </router-link>
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-bordered align-middle">
          <thead class="table-dark">
            <tr>
              <th width="80">Ảnh</th>
              <th>Tên sách</th>
              <th>Thể loại</th>
              <th>Tác giả</th>
              <th>Nhà xuất bản</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sach in sachs" :key="sach._id">
              <td>
                <img
                  v-if="sach.Anh"
                  :src="`http://localhost:3000${sach.Anh}`"
                  alt="Ảnh bìa"
                  width="100"
                  class="rounded shadow-sm"
                  style="object-fit: cover"
                />
                <span v-else class="text-muted small">—</span>
              </td>

              <td class="word-break" style="max-width: 130px">
                {{ sach.TenSach }}
              </td>
              <td class="word-break" style="max-width: 130px">
                {{ sach.TheLoai }}
              </td>
              <td class="word-break" style="max-width: 130px">
                {{ sach.TenTacGia || "—" }}
              </td>
              <td class="word-break" style="max-width: 130px">
                {{ sach.TenNXB || "—" }}
              </td>
              <td class="text-truncate" style="max-width: 130px">
                {{ sach.SoLuong }}
              </td>
              <td class="text-truncate" style="max-width: 130px">
                {{ Number(sach.DonGia).toLocaleString("vi-VN") }}đ
              </td>
              <td
                class="text-truncate"
                style="max-width: 130px"
                @click="toggleStatus(sach._id, sach.TrangThai)"
              >
                <button v-if="sach.TrangThai == 'on'" class="btn btn-success">
                  Đang bật
                </button>
                <button v-if="sach.TrangThai == 'off'" class="btn btn-danger">
                  Đang tắt
                </button>
              </td>
              <td>
                <router-link
                  :to="{ name: 'book.detail', params: { id: sach._id } }"
                  class="me-2"
                >
                  <button class="btn btn-primary">
                    <i class="fa-solid fa-circle-info"></i>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'book.update', params: { id: sach._id } }"
                  class="me-2"
                >
                  <button class="btn btn-warning">
                    <i class="fa-solid fa-pen-to-square"></i>
                  </button>
                </router-link>

                <button class="btn btn-danger" @click="confirmDelete(sach._id)">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="sachs.length === 0" class="text-center py-5 text-muted">
          <h5>Không có sách nào</h5>
        </div>
      </div>

      <nav v-if="totalPages > 1" class="mt-4">
        <ul class="pagination justify-content-center">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a
              class="page-link"
              href="#"
              @click.prevent="fetchSachs(currentPage - 1)"
              >Trước</a
            >
          </li>
          <li
            v-for="page in visiblePages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <a class="page-link" href="#" @click.prevent="fetchSachs(page)">{{
              page
            }}</a>
          </li>
          <li
            class="page-item"
            :class="{ disabled: currentPage === totalPages }"
          >
            <a
              class="page-link"
              href="#"
              @click.prevent="fetchSachs(currentPage + 1)"
              >Sau</a
            >
          </li>
        </ul>
        <div class="text-center text-muted small">
          Trang {{ currentPage }} / {{ totalPages }} (Tổng:
          {{ totalItems }} sách)
        </div>
      </nav>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Swal from "sweetalert2";
import SachService from "@/services/book.service";

const sachs = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalItems = ref(0);
const searchKeyword = ref("");
const statusFilter = ref("");

const router = useRouter();

const fetchSachs = async (page = 1) => {
  try {
    currentPage.value = page;
    const response = await SachService.getAll(
      page,
      7,
      searchKeyword.value.trim(),
      statusFilter.value
    );

    sachs.value = response.data || [];
    totalItems.value = response.pagination.total;
    totalPages.value = response.pagination.totalPages;
  } catch (err) {
    console.error("Lỗi tải sách:", err);

    sachs.value = [];
    currentPage.value = 1;
    totalPages.value = 1;
    totalItems.value = 0;

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

  // Nếu thiếu 7 trang thì dịch ngược lại
  if (end - start + 1 < max) {
    start = Math.max(1, end - max + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return pages;
});

const confirmDelete = async (id) => {
  const result = await Swal.fire({
    title: "Xóa sách này?",
    text: "Không thể hoàn tác!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Xóa",
    cancelButtonText: "Hủy",
    theme: "dark",
  });

  if (result.isConfirmed) {
    try {
      await SachService.delete(id);
      Swal.fire({
        title: "Xóa thành công",
        icon: "success",
        theme: "dark",
      });
      await fetchSachs(currentPage.value);
    } catch (err) {
      await Swal.fire({
        title: "Lỗi",
        text: err.response?.data?.message || "Không thể xóa",
        icon: "error",
        theme: "dark",
      });
    }
  }
};

const toggleStatus = async (id, currentStatus) => {
  const newStatus = currentStatus === "on" ? "off" : "on";

  const result = await Swal.fire({
    title: "Xác nhận",
    text: "Đổi trạng thái sách?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Đổi",
    cancelButtonText: "Hủy",
    theme: "dark",
  });

  if (result.isConfirmed) {
    try {
      const res = await SachService.toggleStatus(id);
      Swal.fire({
        title: "Thành công!",
        text: `Trạng thái đã đổi thành ${res.trangThai}`,
        icon: "success",
        theme: "dark",
      });
      sachs.value.find((sach) => sach._id == id).TrangThai = newStatus;
    } catch (err) {
      console.log(err);
      Swal.fire({
        title: "Lỗi",
        text: err.response?.data?.message || "Không thể cập nhật",
        icon: "error",
        theme: "dark",
      });
    }
  }
};

onMounted(async () => {
  await fetchSachs();
});
</script>

<style scoped>
.table img {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
.badge {
  font-size: 0.85rem;
}

.word-break {
  word-break: break-word;
  overflow-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
  padding: 8px 6px !important;
}
</style>