import router from "./router";
import setupVeeValidate from "./plugins/vee-validate";
import { createApp } from "vue";
import App from "./App.vue";

// Toast
import Toast from "@/utils/toast";

// CSS
import "./assets/styles/global.css";

const app = createApp(App);

// Đăng ký toast toàn cục
app.provide("toast", Toast);

setupVeeValidate();
app.use(router).mount("#app");
