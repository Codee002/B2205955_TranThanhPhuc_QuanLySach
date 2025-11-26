<template>
  <header>
    <div
      class="d-flex align-items-center"
      style="height: 100%; width: 100em; margin-right: 4rem"
    >
      <!-- <p class="ms-3">Trang chủ</p> -->
    </div>

    <!-- User Nav -->
    <div class="info-group dropdown-toggle" style="height: 100%; width: 100em">
      <!-- Notification -->
      <div class="notifi__wrapper">
        <i class="fa-solid fa-bell" @click="toggleNotification"></i>
        <span class="notification-dot"></span>
      </div>

      <!-- Setting -->
      <img class="avatar" src="" @click="toggleSetting" alt="" />

      <!-- Dropdown Setting -->
      <ul class="dropdown-menu show" v-if="isSettingOpen && user">
        <router-link class="d-flex">
          <nav-component>
            <template v-slot:icon>
              <img class="avatar" src="" alt="" />
            </template>
            <template v-slot:des>TEST</template>
          </nav-component>
        </router-link>
        <hr />
        <router-link
          v-if="user.role == 'admin'"
          :to="{ name: 'home' }"
          class="d-flex"
        >
          <nav-component>
            <template v-slot:icon>
              <i class="fa-solid fa-house"></i>
            </template>
            <template v-slot:des>Trang chủ</template>
          </nav-component>
        </router-link>
        <router-link :to="{ name: 'setting.info' }" class="d-flex">
          <nav-component>
            <template v-slot:icon>
              <i class="fa-solid fa-gear"></i>
            </template>
            <template v-slot:des>Cài đặt & quyền riêng tư</template>
          </nav-component>
        </router-link>
        <router-link
          :to="{ name: 'auth.login' }"
          class="d-flex"
          @click="logout()"
        >
          <nav-component>
            <template v-slot:icon>
              <i class="fa-solid fa-right-from-bracket"></i>
            </template>
            <template v-slot:des>Đăng xuất</template>
          </nav-component>
        </router-link>
      </ul>
    </div>
  </header>
</template>


<script setup>
// ----------------------- Import -----------------------
import { ref, defineProps } from "vue";
import axios from "axios";
import NavComponent from "@/components/utils/NavComponent.vue";
import router from "@/router";
// import auth from '@/utils/auth.js'

// ----------------------- Var -----------------------
const isSettingOpen = ref(false);
const isNotificationOpen = ref(false);

// ----------------------- Function -----------------------

defineProps({
  user: {
    type: Object,
    require: true,
    default: null,
  },
  notifications: {},
});

// Mở setting
function toggleSetting() {
  isSettingOpen.value = !isSettingOpen.value;
  isNotificationOpen.value = false;
}

// Mở thông báo
function toggleNotification() {
  isNotificationOpen.value = !isNotificationOpen.value;
  isSettingOpen.value = false;
}
</script>

<style scoped>
header {
  position: fixed;
  display: flex;
  top: 0;
  height: 3.6rem;
  border-color: var(--main1-color) !important;
  box-shadow: 0 0 0 0.05rem var(--main1color) !important;
  background-color: var(--main-extra-bg);
  width: 82%;
  justify-content: space-between;
  align-items: center;
  z-index: 100;
  border-bottom: 1px solid var(--border-color) !important;
  padding: 1rem;
}

header p {
  margin: 0;
  padding: 0;
}

header .avatar {
  width: 7%;
  border-radius: 2rem;
  cursor: pointer;
}

.header-nav {
  display: flex;
  width: 40rem;
  justify-content: space-evenly;
  align-items: center;
  gap: 1rem;
}

.info-group {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: end;
  margin: 1rem;
}

.info-group i {
  cursor: pointer;
  font-size: 1.4rem;
  margin-right: 1rem;
  transition: 0.2s;
  color: v-bind(
    'isNotificationOpen ? "var(--main1-color)" : "var(--font-color)"'
  );
}

.info-group i:hover {
  color: var(--main1-color);
}

.dropdown-menu {
  background-color: var(--main-extra-bg);
  width: 22rem;
  top: 2.4rem !important;
  transform: none !important;
  border: none;
  border-radius: 0 0 0.5rem 0.5rem;
  box-shadow: rgba(0, 0, 0, 0.1) -0.1rem 0.5rem 0.5rem 0.25rem;
  left: 14rem !important;
  padding: 0.6rem;
}

.dropdown-toggle::after {
  content: unset !important;
}

.dropdown__notification {
  overflow-y: auto;
  min-height: 7rem;
  max-height: 35rem;
  padding: 1rem;
}

.dropdown__notification .notification__all {
  color: var(--main1-color);
}

.notifi__wrapper {
  position: relative;
  width: fit-content;
}

.notification-dot {
  position: absolute;
  width: 0.4rem;
  height: 0.4rem;
  right: 1.1rem;
  color: red;
  background-color: red;
  border-radius: 50%;
}

.notification-count {
  position: absolute;
  color: red;
  font-size: 0.9rem;
  font-weight: 700;
}
</style>
