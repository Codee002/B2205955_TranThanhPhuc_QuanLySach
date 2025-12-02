<template>
  <div class="py-5 min-vh-100">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-9">
          <!-- Loading & Không tìm thấy -->
          <div v-if="loading" class="text-center py-5">
            <div
              class="spinner-border text-primary"
              style="width: 3.5rem; height: 3.5rem"
            ></div>
          </div>
          <div v-else-if="!borrow" class="text-center py-5">
            <h4 class="text-danger">Không tìm thấy phiếu mượn</h4>
            <router-link
              :to="{ name: 'borrow' }"
              class="btn btn-outline-primary mt-3"
            >
              Quay lại
            </router-link>
          </div>

          <!-- Nội dung chính -->
          <div v-else>
            <!-- Tiêu đề + Mã phiếu + Trạng thái -->
            <div
              class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom"
            >
              <div>
                <h3 class="fw-bold text-primary mb-1">Chi tiết phiếu mượn</h3>
                <p class="text-muted mb-0">
                  Mã phiếu:
                  <strong
                    >#{{
                      borrow._id.toString().slice(-6).toUpperCase()
                    }}</strong
                  >
                </p>
              </div>
              <span
                class="badge rounded-pill px-4 py-3 fs-5"
                :class="getStatusClass(borrow.TrangThai)"
              >
                {{ getStatusText(borrow.TrangThai) }}
              </span>
            </div>

            <div class="row g-5">
              <!-- Ảnh sách -->
              <div class="col-md-4">
                <div class="card border-0 shadow-sm text-center">
                  <img
                    :src="baseUrl + borrow.sach.Anh"
                    class="card-img-top rounded"
                    style="height: 380px; object-fit: cover"
                    :alt="borrow.sach.TenSach"
                  />
                  <div class="card-body pt-3">
                    <h5 class="fw-bold text-primary">
                      {{ borrow.sach.TenSach }}
                    </h5>
                    <p class="text-muted small mb-1">
                      {{ borrow.sach.TacGia }}
                    </p>
                    <p class="text-muted small">
                      Thể loại: {{ borrow.sach.TheLoai }}
                    </p>
                    <p class="text-muted small">
                      NXB: {{ borrow.sach.TenNXB }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Bảng thông tin phiếu mượn (TẤT CẢ Ở ĐÂY) -->
              <div class="col-md-8">
                <div class="card border-0 shadow-sm h-100">
                  <div class="card-header bg-primary text-white py-3">
                    <h5 class="mb-0 text-center fw-bold">
                      Thông tin chi tiết phiếu mượn
                    </h5>
                  </div>
                  <div class="card-body">
                    <table class="table table-borderless table-hover">
                      <tbody>
                        <tr>
                          <td class="text-muted fw-medium" width="40%">
                            Người mượn
                          </td>
                          <td class="fw-bold">{{ borrow.docGia.HoTen }}</td>
                        </tr>
                        <tr>
                          <td class="text-muted fw-medium">Mã độc giả</td>
                          <td>
                            <strong
                              >#{{
                                borrow.docGia._id
                                  .toString()
                                  .slice(-6)
                                  .toUpperCase()
                              }}</strong
                            >
                          </td>
                        </tr>
                        <tr>
                          <td class="text-muted fw-medium">Ngày tạo phiếu</td>
                          <td class="fw-bold text-primary">
                            {{ formatDate(borrow.NgayMuon) }}
                          </td>
                        </tr>
                        <tr>
                          <td class="text-muted fw-medium">Ngày duyệt</td>
                          <td class="text-success fw-bold">
                            {{ formatDate(borrow.NgayDuyet) }}
                          </td>
                        </tr>
                        <tr>
                          <td class="text-muted fw-medium">Hạn trả sách</td>
                          <td
                            class="fw-bold"
                            :class="
                              daysOverdue != 0 ? 'text-danger' : 'text-warning'
                            "
                          >
                            {{ formatDate(borrow.HanTra) }}
                            <small v-if="daysOverdue != 0" class="d-block"
                              >(Đã quá hạn)</small
                            >
                          </td>
                        </tr>
                        <tr>
                          <td class="text-muted fw-medium">Ngày trả sách</td>
                          <td class="text-success fw-bold">
                            {{ formatDate(borrow.NgayTra) }}
                          </td>
                        </tr>
                        <tr>
                          <td class="text-muted fw-medium">Số ngày quá hạn</td>
                          <td class="text-danger fw-bold">
                            {{ daysOverdue }} ngày
                          </td>
                        </tr>
                        <tr>
                          <td class="text-muted fw-medium">Tiền phạt</td>
                          <td class="text-danger fw-bold">
                            {{ formatCurrency(daysOverdue) }}đ
                            <small class="d-block text-muted"
                              >(10.000đ/ngày)</small
                            >
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <!-- Ghi chú phạt -->
                    <div
                      v-if="borrow.TrangThai === 'Đang mượn'"
                      class="alert alert-warning py-3 mt-4 text-center"
                    >
                      <strong>Phạt 10.000đ/ngày</strong> nếu trả sách sau hạn
                      trả
                    </div>

                    <div class="mt-4 text-center">
                      <button
                        v-if="borrow.TrangThai === 'Chờ duyệt'"
                        @click="approve"
                        class="btn btn-success btn me-3 px-5 fw-bold"
                      >
                        Duyệt phiếu
                      </button>

                      <button
                        v-if="borrow.TrangThai === 'Chờ duyệt'"
                        @click="reject"
                        class="btn btn-danger btn me-3 px-5 fw-bold"
                      >
                        Từ chối
                      </button>

                      <button
                        v-if="borrow.TrangThai === 'Đang mượn'"
                        @click="returnBook"
                        class="btn btn-primary btn px-5 fw-bold"
                      >
                        Xác nhận đã trả
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Nút quay lại -->
            <div class="text-end mt-3">
              <button class="btn btn-secondary fw-bold">
                <router-link
                  :to="{ name: 'borrow' }"
                  style="color: #fff !important"
                >
                  Quay lại
                </router-link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import BorrowService from "@/services/borrow.service";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();
const borrow = ref(null);
const loading = ref(true);
const baseUrl = import.meta.env.VITE_BACKEND_URL || "";

const loadBorrowDetail = async () => {
  const id = route.params.id;
  if (!id) return;

  try {
    loading.value = true;
    const res = await BorrowService.get(id);
    borrow.value = res.data || res;
  } catch (err) {
    console.error(err);
    Swal.fire({
      title: "Lỗi",
      text: "Không thể tải lại thông tin phiếu",
      icon: "error",
      theme: "dark",
    });
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadBorrowDetail();
});

const approve = async () => {
  const { isConfirmed } = await Swal.fire({
    title: "Duyệt phiếu mượn?",
    text: "Sau khi duyệt, độc giả có thể mượn sách trong 7 ngày",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Duyệt ngay",
    cancelButtonText: "Hủy",
    theme: "dark",
  });

  if (isConfirmed) {
    try {
      await BorrowService.approve(route.params.id);
      await loadBorrowDetail();
      Swal.fire({
        title: "Thành công!",
        text: "Phiếu đã được duyệt",
        icon: "success",
        theme: "dark",
      });
    } catch (err) {
      Swal.fire({
        title: "Lỗi",
        text: err.message || "Không thể duyệt phiếu",
        icon: "error",
        theme: "dark",
      });
    }
  }
};

const reject = async () => {
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
      await BorrowService.reject(route.params.id);
      await loadBorrowDetail();
      Swal.fire({
        title: "Đã từ chối",
        text: "Phiếu mượn đã bị hủy",
        icon: "success",
        theme: "dark",
      });
    } catch (err) {
      Swal.fire({
        title: "Lỗi",
        text: err.message || "Không thể từ chối",
        icon: "error",
        theme: "dark",
      });
    }
  }
};

const returnBook = async () => {
  const { isConfirmed } = await Swal.fire({
    title: "Xác nhận đã trả sách?",
    text: "Sau khi xác nhận, phiếu sẽ chuyển sang trạng thái Đã trả",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Đã trả sách",
    theme: "dark",
  });

  if (isConfirmed) {
    try {
      await BorrowService.return(route.params.id, daysOverdue.value);
      await loadBorrowDetail();
      Swal.fire({
        title: "Thành công!",
        text: "Đã xác nhận trả sách",
        icon: "success",
        theme: "dark",
      });
    } catch (err) {
      Swal.fire({
        title: "Lỗi",
        text: err.message || "Không thể xác nhận trả sách",
        icon: "error",
        theme: "dark",
      });
    }
  }
};

const daysOverdue = computed(() => {
  if (!borrow.value?.HanTra) return 0;

  const allowedStatuses = ["Đang mượn", "Đã trả"];
  if (!allowedStatuses.includes(borrow.value.TrangThai)) return 0;

  const hanTra = new Date(borrow.value.HanTra);
  const ngayTra = borrow.value.NgayTra
    ? new Date(borrow.value.NgayTra)
    : new Date();

  if (ngayTra <= hanTra) return 0;

  const diffMs = ngayTra - hanTra;

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
});

const isOverdue = computed(() => daysOverdue.value > 0);

const formatDate = (date) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatCurrency = (days) => {
  const fine = days * 10000;
  return new Intl.NumberFormat("vi-VN").format(fine);
};

const getStatusText = (s) =>
  ({
    "Chờ duyệt": "Chờ duyệt",
    "Đang mượn": "Đang mượn",
    "Đã trả": "Đã trả",
    "Từ chối": "Từ chối",
    "Đã hủy": "Đã hủy",
  }[s] || s);

const getStatusClass = (s) =>
  ({
    "Chờ duyệt": "bg-warning text-white",
    "Đang mượn": "bg-success text-white",
    "Đã trả": "bg-secondary text-white",
    "Từ chối": "bg-danger text-white",
    "Đã hủy": "bg-danger text-white",
  }[s] || "bg-light text-dark");
</script>

<style scoped>
.table tr:hover {
  background-color: #f8f9fa;
}
.table td:first-child {
  width: 40%;
}
</style>