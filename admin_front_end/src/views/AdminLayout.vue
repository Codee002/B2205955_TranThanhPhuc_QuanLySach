<template>
  <div class="d-flex" style="min-height: 100%; margin-bottom: 1rem">
    <div class="nav__bar" style="width: 18%">
      <nav-bar></nav-bar>
    </div>
    <div class="" style="width: 82%">
      <header-component></header-component>
      <router-view style="margin-top: 5rem"></router-view>
    </div>
  </div>
</template>

<script setup>
import NavBar from "@/components/utils/NavBar.vue";
import HeaderComponent from "@/components/utils/HeaderComponent.vue";
import axios from "axios";
import { ref } from "vue";

const owner = ref(null);
const notifications = ref([]);
</script>

<style scoped>
.nav__bar {
  width: 20rem;
}
</style>
