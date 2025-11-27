<template>
  <main class="app-main p-0" style="height: 100%">
    <div class="container" style="width: 90%">
      <h2 class="text-center fw-bolder mt-4 mb-4">Quản lý danh mục</h2>
      <div class="d-flex align-items-center mb-1 row">
        <div class="col-4">
          <div class="form-group d-flex">
            <input
              placeholder="Tên danh mục"
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
          <router-link :to="{ name: 'category.create' }">
            <button class="btn btn-success text-white text-end ms-3">
              Thêm danh mục
            </button>
          </router-link>
        </div>
      </div>

      <table class="table table-bordered table-striped mt-3">
        <thead>
          <tr>
            <th>Tên danh mục</th>
            <th>Số sách</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody v-if="categorysSearch.length != 0">
          <tr v-for="category in categorysSearch" :key="category._id">
            <td>{{ category.Ten }}</td>
            <td>{{ category.soLuongSach }}</td>
            <td>
              <router-link
                :to="{ name: 'category.update', params: { id: category._id } }"
                class="me-2"
              >
                <button class="btn btn-warning">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
              </router-link>

              <button class="btn btn-danger" @click="deleteCategory(category)">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
        <div v-else class="mt-3">
          <h5>Không tìm thấy danh mục</h5>
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
import CategoryService from "@/services/category.service";
import Swal from "sweetalert2";

onMounted(async () => {
  await getCategorys();
});

let categorys = ref([]);
let nameSearch = ref("");

// Lấy danh mục
const getCategorys = async () => {
  try {
    categorys.value = await CategoryService.getAll();
  } catch (error) {
    console.log(error);
  }
};

// Tìm kiếm
const categorysSearch = computed(() =>
  categorys.value.filter((category) => {
    let result = category.Ten.toLowerCase().includes(
      nameSearch.value.toLowerCase()
    );

    return result;
  })
);

// Xóa danh mục
const deleteCategory = async (category) => {
  const result = await Swal.fire({
    title: "Bạn có chắc muốn xóa danh mục " + category.Ten + "?",
    showCancelButton: true,
    confirmButtonText: "Xóa",
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    theme: "dark",
    // denyButtonText: `Don't save`,
  });

  if (result.isConfirmed) {
    try {
      console.log(category);
      await CategoryService.delete(category._id);
      await Swal.fire({
        title: "Đã xóa!",
        text: `${category.Ten} đã được xóa thành công.`,
        icon: "success",
        timer: 2000,
        theme: "dark",
      });

      categorys.value = categorys.value.filter(
        (categoryInArray) => categoryInArray._id != category._id
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
