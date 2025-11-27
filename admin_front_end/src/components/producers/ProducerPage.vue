<template>
  <main class="app-main p-0" style="height: 100%">
    <div class="container" style="width: 90%">
      <h2 class="text-center fw-bolder mt-4 mb-4">Quản lý nhà xuất bản</h2>
      <div class="d-flex align-items-center mb-1 row">
        <div class="col-4">
          <div class="form-group d-flex">
            <input
              placeholder="Tên nhà xuất bản"
              class="form-control me-1"
              v-model="nameSearch"
            />
            <!-- <select class="form-select me-1" v-model="statusSearch">
              <option value="" disabled="" selected="">Trạng thái</option>
              <option value="actived">Đang hoạt động</option>
              <option value="disabled">Đang khóa</option>
            </select> -->

            <button
              type="submit"
              class="btn btn-primary text-white text-decoration-none m-1"
            >
              Tìm
            </button>
          </div>
        </div>
        <div class="text-end col-8">
          <router-link :to="{ name: 'producer.create' }">
            <button class="btn btn-success text-white text-end ms-3">
              Thêm nhà xuất bản
            </button>
          </router-link>
        </div>
      </div>

      <table class="table table-bordered table-striped mt-3">
        <thead>
          <tr>
            <th>Tên nhà xuất bản</th>
            <th>Địa chỉ</th>
            <th>Số sách</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody v-if="producersSearch.length != 0">
          <tr v-for="producer in producersSearch" :key="producer._id">
            <td>{{ producer.TenNXB }}</td>
            <td>{{ producer.DiaChi }}</td>
            <td>{{ producer.soLuongSach }}</td>
            <td>
              <router-link
                :to="{ name: 'producer.update', params: { id: producer._id } }"
                class="me-2"
              >
                <button class="btn btn-warning">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
              </router-link>

              <button class="btn btn-danger" @click="deleteProducer(producer)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
        <div v-else class="mt-3">
          <h5>Không tìm thấy nhà xuất bản</h5>
        </div>
      </table>

      <nav v-if="pagination">
        <ul class="pagination justify-content-center">
          <!-- Trang trước -->
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a
              class="page-link"
              href="#"
              @click.prevent="goToPage(currentPage - 1)"
              >«</a
            >
          </li>

          <!-- Các trang -->
          <li
            v-for="page in visiblePages"
            :key="page"
            class="page-item"
            :class="{ active: currentPage === page }"
          >
            <a class="page-link" href="#" @click.prevent="goToPage(page)">{{
              page
            }}</a>
          </li>

          <!-- Trang sau -->
          <li class="page-item" :class="{ disabled: currentPage === lastPage }">
            <a
              class="page-link"
              href="#"
              @click.prevent="goToPage(currentPage + 1)"
              >»</a
            >
          </li>
        </ul>
      </nav>
    </div>
  </main>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import axios from "axios";
import ProducerService from "@/services/producer.service";
import Swal from "sweetalert2";

onMounted(async () => {
  await getProducers();
});

let producers = ref([]);
let nameSearch = ref("");

// Lấy nhà xuất bản
const getProducers = async () => {
  try {
    producers.value = await ProducerService.getAll();
  } catch (error) {
    console.log(error);
  }
};

// Tìm kiếm
const producersSearch = computed(() =>
  producers.value.filter((producer) => {
    let result = producer.TenNXB.toLowerCase().includes(
      nameSearch.value.toLowerCase()
    );

    return result;
  })
);

// Xóa nhà xuất bản
const deleteProducer = async (producer) => {
  const result = await Swal.fire({
    title: "Bạn có chắc muốn xóa nhà sản xuất " + producer.TenNXB + "?",
    showCancelButton: true,
    confirmButtonText: "Xóa",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    theme: "dark",
    // denyButtonText: `Don't save`,
  });

  if (result.isConfirmed) {
    try {
      console.log(producer);
      await ProducerService.delete(producer._id);
      await Swal.fire({
        title: "Đã xóa!",
        text: `${producer.TenNXB} đã được xóa thành công.`,
        icon: "success",
        timer: 2000,
        theme: "dark",
      });

      producers.value = producers.value.filter(
        (producerInArray) => producerInArray._id != producer._id
      );
    } catch (error) {
      await Swal.fire({
        title: "Lỗi",
        text: error.response?.data?.message || "Không thể xóa",
        icon: "error",
        theme: "dark",
      });
      console.log(error);
    }
  }
};
</script>
