<template>
  <div class="d-flex flex-column min-vh-100">
    <Header />
    <main class="flex-fill" style="padding-top: 4rem">
      <router-view></router-view>
    </main>
    <Footer />
  </div>
</template>

<script setup>
import Header from "./Header.vue";
import Footer from "./Footer.vue";
</script>