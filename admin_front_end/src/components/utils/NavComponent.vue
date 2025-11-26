<template>
  <div class="d-flex nav-group">
    <slot name="icon"></slot>
    <slot name="des"></slot>
    <br />
    <slot name="message"></slot>
    <slot name="time">
    </slot>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'
defineProps({
  isHoverable: {
    type: Boolean,
    default: true,
  },
})
</script>

<style scoped>
.nav-group {
  width: 100%;
  height: 100%;
  justify-content: start;
  align-items: center;
  padding: 1rem;
  border-radius: 0.8rem;
  font-weight: 500;
  font-size: 1.1rem;
}

.nav-group :deep(i) {
  font-size: 1.2rem;
  margin-right: 1rem;
}

.nav-group :deep(img) {
  width: 13% !important;
  margin-right: 1rem;
}

.nav-group :deep(p) {
  display: contents;
  white-space: nowrap; /* Ngăn chặn xuống dòng */
  overflow: hidden; /* Ẩn phần vượt quá */
  text-overflow: ellipsis; /* Thêm dấu ... khi nội dung bị cắt */
  max-width: 200px;
  /* font-weight: 350; */
}

.nav-group:hover {
  background-color: v-bind('isHoverable ? "var(--extra-bg)" : unset');
}
</style>
