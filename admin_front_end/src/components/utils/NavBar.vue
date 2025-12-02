<template>
  <div class="side__bar">
    <div class="side__bar__title">
      <p>Quản lý</p>
    </div>
    <hr />
    <div class="side__bar__feature">
      <div class="feature__container">
        <div class="feature__group">
          <router-link
            :to="{ name: 'dashboard' }"
            class="d-flex"
            style="width: 100%"
          >
            <div class="d-flex nav-group">
              <i class="fa-solid fa-chart-area"></i>
              Thống kê
              <br />
            </div>
          </router-link>
        </div>
      </div>

      <div class="feature__container">
        <!-- <p class="feature__title">Quản lý sách</p> -->
        <div class="feature__group">
          <router-link
            :to="{ name: 'book' }"
            class="d-flex"
            style="width: 100%"
          >
            <div class="d-flex nav-group">
              <i class="fa-solid fa-book"></i>
              Quản lý sách
              <br />
            </div>
          </router-link>
        </div>
      </div>

      <div class="feature__container">
        <!-- <p class="feature__title">Quản lý sách</p> -->
        <div class="feature__group">
          <router-link
            :to="{ name: 'borrow' }"
            class="d-flex"
            style="width: 100%"
          >
            <div class="d-flex nav-group">
              <i class="fa-solid fa-list"></i>
              Quản lý phiếu mượn
              <br />
            </div>
          </router-link>
        </div>
      </div>

      <!-- Đọc giả -->
      <div class="feature__container">
        <!-- <p class="feature__title">Quản lý tác giả</p> -->
        <div class="feature__group">
          <router-link
            :to="{ name: 'reader' }"
            class="d-flex"
            style="width: 100%"
          >
            <div class="d-flex nav-group">
              <i class="fa-solid fa-book-open-reader"></i>
              Quản lý độc giả
              <br />
            </div>
          </router-link>
        </div>
      </div>

      <!-- Tác giả -->
      <div class="feature__container">
        <!-- <p class="feature__title">Quản lý tác giả</p> -->
        <div class="feature__group">
          <router-link
            :to="{ name: 'author' }"
            class="d-flex"
            style="width: 100%"
          >
            <div class="d-flex nav-group">
              <i class="fa-solid fa-feather"></i>
              Quản lý tác giả
              <br />
            </div>
          </router-link>
        </div>
      </div>

      <!-- Nhà xuất bản -->
      <div class="feature__container">
        <!-- <p class="feature__title">Quản lý NXB</p> -->
        <div class="feature__group">
          <router-link
            :to="{ name: 'producer' }"
            class="d-flex"
            style="width: 100%"
          >
            <div class="d-flex nav-group">
              <i class="fa-solid fa-industry"></i>
              Quản lý NXB
              <br />
            </div>
          </router-link>
        </div>
      </div>

      <!-- Danh mục -->
      <div class="feature__container">
        <!-- <p class="feature__title">Quản lý NXB</p> -->
        <div class="feature__group">
          <router-link
            :to="{ name: 'category' }"
            class="d-flex"
            style="width: 100%"
          >
            <div class="d-flex nav-group">
              <i class="fa-solid fa-layer-group"></i>
              Danh mục
              <br />
            </div>
          </router-link>
        </div>
      </div>

      <div class="feature__container">
        <!-- <p class="feature__title">Quản lý sách</p> -->
        <div class="feature__group" @click="logout()">
          <router-link class="d-flex" style="width: 100%">
            <div class="d-flex nav-group">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
              Đăng xuất
              <br />
            </div>
          </router-link>
        </div>
      </div>
    </div>
  </div>
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
.side__bar {
  display: flex;
  flex-direction: column;
  background-color: var(--main-extra-bg);
  border: 1px solid var(--extra-bg);
  min-height: 100%;
  position: fixed;
  width: 18%;
}

.side__bar__title {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin: 1rem 0rem;
}

.side__bar__title p {
  padding: 0;
  margin: 0;
  font-weight: 600;
  font-size: 1.4rem;
}

.side__bar__feature {
  display: flex;
  flex-direction: column;
  width: 100%;
  /* font-weight: 500; */
}

.feature__container {
  display: flex;
  width: 100%;
  flex-direction: column;
  padding: 0.4rem 1rem;
}

.feature__title {
  font-size: 1rem;
  padding: 0rem;
  margin: 0;
}

.nav-group {
  width: 100%;
  height: 100%;
  justify-content: start;
  align-items: center;
  padding: 0.8rem;
  border-radius: 0.8rem;
  /* font-weight: 500; */
  font-size: 1rem;
  margin-left: 0.2rem;
}

.nav-group i {
  font-size: 1rem;
  margin-right: 0.8rem;
}

.nav-group:hover {
  background-color: var(--extra-bg);
}
</style>
