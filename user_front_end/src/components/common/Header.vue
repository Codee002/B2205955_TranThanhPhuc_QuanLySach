<template>
  <header class="border-bottom bg-white">
    <div class="container py-3">
      <div class="d-flex align-items-center justify-content-between">
        <router-link
          :to="{ name: 'home' }"
          class="d-flex align-items-center text-decoration-none"
        >
          <div
            class="bg-primary rounded me-3"
            style="width: 40px; height: 40px"
          ></div>
          <h5 class="mb-0 text-primary fw-bold">VioBook</h5>
        </router-link>

        <nav class="d-none d-md-flex gap-4 align-items-center">
          <div class="position-relative">
            <!-- <input
              type="text"
              class="form-control rounded-pill ps-5"
              placeholder="Tìm kiếm..."
              style="width: 30rem"
            /> -->
            <i
              class="bi bi-search position-absolute top-50 start-3 translate-middle-y text-muted"
            ></i>
          </div>
        </nav>

        <div class="d-flex align-items-center gap-3">
          <router-link
            :to="{ name: 'book' }"
            class="text-dark text-decoration-none fw-medium"
            >Tất Cả Sách</router-link
          >
          <router-link
            :to="{ name: 'borrow.history' }"
            class="text-dark text-decoration-none fw-medium"
            >Sách đã mượn</router-link
          >
          <router-link
            :to="{ name: 'profile.edit' }"
            class="text-dark text-decoration-none fw-medium"
            >Tài khoản
          </router-link>

          <a
            style="cursor: pointer"
            class="text-dark text-decoration-none fw-medium"
            @click="logout"
          >
            Đăng xuất
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import router from "@/router";
import authService from "@/services/auth.service";

const logout = async () => {
  await authService.logout();
  router.push("/login");
};
</script>

<style scoped>
header {
  position: fixed;
  width: 100%;
  z-index: 10000;
}
</style>