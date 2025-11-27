import authService from "@/services/auth.service";
import { createRouter, createWebHistory } from "vue-router";
// import Dashboard from "@/views/Dashboard.vue";

const routes = [
  { path: "/login", component: () => import("@/views/AuthView.vue") },
  {
    path: "/",
    component: () => import("@/components/common/Layout.vue"),
    children: [
      // Trang chủ
      {
        path: "home",
        name: "home",
        meta: { requiresAuth: true, title: "Trang chủ" },
        component: () => import("@/components/home/HomePage.vue"),
      },

      // Trang sách
      {
        path: "book",
        name: "book",
        meta: { requiresAuth: true, title: "Tất cả sách" },
        component: () => import("@/components/book/BookList.vue"),
      },
      {
        path: "book/:id",
        name: "book.detail",
        meta: { requiresAuth: true, title: "Chi tiết sách" },
        component: () => import("@/components/book/detail/BookDetail.vue"),
      },

      // Mượn sách
      {
        path: "/borrow/:book_id",
        name: "borrow.confirm",
        meta: { requiresAuth: true, title: "Mượn sách" },
        component: () => import("@/components/borrow/BorrowConfirm.vue"),
      },

      // Lịch sử mượn
      {
        path: "/history",
        name: "borrow.history",
        component: () => import("@/components/borrow/BorrowHistory.vue"),
        meta: { requiresAuth: true, title: "Lịch sử mượn sách" },
      },

      // Chi tiết phiếu mượn
      {
        path: "/borrow/detail/:id",
        name: "borrow.detail",
        component: () => import("@/components/borrow/BorrowDetail.vue"),
        meta: { requiresAuth: true, title: "Chi tiết phiếu mượn" },
      },

      // Tài khoản
      {
        path: "/profile/edit",
        name: "profile.edit",
        meta: { requiresAuth: true, title: "Tài khoản" },
        component: () => import("@/components/profile/EditProfile.vue"),
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/components/error/NotFound.vue"),
    meta: { title: "Không tìm thấy trang" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to, from, next) => {
  const isLoggedIn = authService.isLoggedIn();

  // Nếu đã login rồi mà cố vào /login → đẩy vào trang chủ admin
  if (to.path === "/login" && isLoggedIn) {
    return next("/home");
  }

  // Nếu chưa login mà vào trang nào cần requiresAuth → đẩy về login
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next("/login");
  }

  next();
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title}` : "VioBook";
});

export default router;
