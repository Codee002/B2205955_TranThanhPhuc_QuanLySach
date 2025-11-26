<template>
  <div class="d-flex align-items-center justify-content-center py-5">
    <AuthTabs @login-success="onLoginSuccess" />
  </div>
</template>

<script setup>
import AuthTabs from "@/components/auth/AuthTab.vue";
import { useRouter } from "vue-router";

const router = useRouter();

const onLoginSuccess = () => {
  router.push("/post");
};
</script>