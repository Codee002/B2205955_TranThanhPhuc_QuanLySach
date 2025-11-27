import router from "./router";
import setupVeeValidate from "./plugins/vee-validate";
import { createApp } from "vue";
import App from "./App.vue";

// CSS
import "./assets/styles/global.css";

const app = createApp(App);

setupVeeValidate();
app.use(router).mount("#app");
