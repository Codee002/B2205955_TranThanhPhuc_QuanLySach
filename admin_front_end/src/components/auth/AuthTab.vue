<!-- src/components/auth/AuthTabs.vue -->
<template>
  <div
    class="card shadow-lg rounded"
    style="
      max-width: 500px;
      width: 100%;
      margin: auto;
      background-color: var(--main-extra-bg);
      padding: 1.3rem 0.8rem;
      max-width: 30rem;
    "
  >
    <ul
      class="nav nav-tabs border-0"
      id="authTab"
      role="tablist"
      style="margin: auto"
    >
      <li class="nav-item flex-fill">
        <button
          class="nav-link w-100"
          :class="{ active: activeTab === 'login' }"
          @click="activeTab = 'login'"
          type="button"
        >
          Đăng nhập
        </button>
      </li>
      <!-- <li class="nav-item flex-fill">
        <button
          class="nav-link w-100"
          :class="{ active: activeTab === 'register' }"
          @click="activeTab = 'register'"
          type="button"
        >
          Đăng ký
        </button>
      </li> -->
    </ul>

    <div class="p-4 form-wrapper">
      <LoginForm v-if="activeTab === 'login'" @success="onLoginSuccess" />
      <RegisterForm v-else @success="onRegisterSuccess" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import LoginForm from "./LoginForm.vue";
import RegisterForm from "./RegisterForm.vue";

const activeTab = ref("login");

const emit = defineEmits(["login-success"]);

const onLoginSuccess = () => {
  emit("login-success");
};

const onRegisterSuccess = () => {
  activeTab.value = "login";
  alert("Đăng ký thành công! Vui lòng đăng nhập.");
};
</script>

<style>
.nav-tabs .nav-link {
  border: none;
  border-radius: 0;
  font-weight: 600;
  color: #6c757d;
}
.nav-tabs .nav-link.active {
  color: var(--main1-color);
  border-bottom: 3px solid var(--main1-color);
}

.form-control {
  background-color: var(--main-extra-bg) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 0.6rem !important;
  color: var(--font-color) !important;
}

.form-control:focus {
  box-shadow: 0 0 0 0.05rem var(--main1-color) !important;
  background-color: var(--main-extra-bg) !important;
  color: var(--font-color) !important;
}

.form-control .pwd-mg {
  position: relative;
}

.form-select:focus {
  background-color: var(--main-extra-bg) !important;
  box-shadow: unset !important;
  border: 1px solid var(--main1-color) !important;
}

.pwd-eye {
  position: absolute;
  right: 0.6rem;
  top: 1rem;
  color: var(--font-input-color);
  z-index: 100;
}

.pwd-eye:hover {
  cursor: pointer;
}

.is-invalid {
  border-color: #dc3545;
}
.invalid-feedback {
  color: #dc3545;
  font-size: 0.9em;
}

.mg-btn {
  display: block;
  width: 100%;
  background-color: var(--main1-color) !important;
  border-color: var(--main1-color) !important;
  box-shadow: 0 0 0 0.05rem var(--main1color) !important;
  border-radius: 0.6rem !important;
  margin: 1.2rem 0;
  color: var(--font-color);
  font-weight: 650;
  transition: 0.2s;
  height: 3rem;
}

.mg-btn:focus {
  box-shadow: 0 0 0 0.25rem rgba(213, 214, 215, 0) !important;
  color: var(--font-color);
}

.mg-btn:hover {
  transform: scale(1.02);
  color: var(--font-color);
  font-weight: 650;
}

.is-invalid {
  border: 1px solid #dc3545 !important;
  display: block !important;
}

.is-invalid:focus {
  border-color: #dc3545 !important;
  box-shadow: none !important;
}
</style>