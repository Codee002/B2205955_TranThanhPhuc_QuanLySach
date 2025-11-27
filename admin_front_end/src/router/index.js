import { createRouter, createWebHistory } from "vue-router";
import AuthView from "@/views/AuthView.vue";
import AdminLayout from "@/views/AdminLayout.vue";
import BookPage from "@/components/books/BookPage.vue";
import AuthorPage from "@/components/authors/AuthorPage.vue";
import AuthorCreate from "@/components/authors/AuthorCreate.vue";
import ProducerPage from "@/components/producers/ProducerPage.vue";
import ProducerCreate from "@/components/producers/ProducerCreate.vue";

import authService from "@/services/auth.service";

const routes = [
  {
    path: "/login",
    component: AuthView,
    meta: { title: "Xác thực" },
  },
  {
    path: "/",
    component: AdminLayout,
    meta: {
      requiresAuth: true,
    },
    children: [
      // Trang chủ
      {
        path: "dashboard",
        component: () => import("@/components/dashboard/DashboardPage.vue"),
        name: "dashboard",
        meta: { requiresAuth: true, title: "Trang chủ" },
      },
      // Trang sách
      {
        path: "book",
        component: BookPage,
        name: "book",
        meta: { requiresAuth: true, title: "Quản lý sách" },
      },
      {
        path: "book/create",
        component: () => import("@/components/books/BookCreate.vue"),
        name: "book.create",
        meta: { requiresAuth: true, title: "Book" },
      },
      {
        path: "book/update/:id",
        component: () => import("@/components/books/BookUpdate.vue"),
        name: "book.update",
        meta: { requiresAuth: true, title: "Book" },
      },
      {
        path: "book/detail/:id",
        component: () => import("@/components/books/BookDetail.vue"),
        name: "book.detail",
        meta: { requiresAuth: true, title: "Book" },
      },

      // Tác giả
      {
        path: "author",
        component: AuthorPage,
        name: "author",
        meta: { requiresAuth: true, title: "Tác Giả" },
      },
      {
        path: "author/create",
        component: AuthorCreate,
        name: "author.create",
        meta: { requiresAuth: true, title: "Thêm Tác Giả" },
      },
      {
        path: "author/update/:id",
        component: () => import("@/components/authors/AuthorUpdate.vue"),
        name: "author.update",
        meta: { requiresAuth: true, title: "Cập Nhật Tác Giả" },
      },

      // Nhà phân phối
      {
        path: "producer",
        component: ProducerPage,
        name: "producer",
        meta: { requiresAuth: true, title: "Nhà Xuất Bản" },
      },
      {
        path: "producer/create",
        component: ProducerCreate,
        name: "producer.create",
        meta: { requiresAuth: true, title: "Thêm Nhà Xuất Bản" },
      },
      {
        path: "producer/update/:id",
        component: () => import("@/components/producers/ProducerUpdate.vue"),
        name: "producer.update",
        meta: { requiresAuth: true, title: "Cập Nhật Nhà Xuất Bản" },
      },

      // Danh mục
      {
        path: "category",
        component: () => import("@/components/categorys/CategoryPage.vue"),
        name: "category",
        meta: { requiresAuth: true, title: "Danh Mục" },
      },
      {
        path: "category/create",
        component: () => import("@/components/categorys/CategoryCreate.vue"),
        name: "category.create",
        meta: { requiresAuth: true, title: "Thêm Danh Mục" },
      },
      {
        path: "category/update/:id",
        component: () => import("@/components/categorys/CategoryUpdate.vue"),
        name: "category.update",
        meta: { requiresAuth: true, title: "Cập Nhật Danh Mục" },
      },

      // Phiếu mượn
      {
        path: "borrow",
        component: () => import("@/components/borrows/BorrowPage.vue"),
        name: "borrow",
        meta: { requiresAuth: true, title: "Phiếu mượn" },
      },
      {
        path: "borrow/create/:id",
        component: () => import("@/components/borrows/BorrowCreate.vue"),
        name: "borrow.create",
        meta: { requiresAuth: true, title: "Tạo phiếu mượn" },
      },
      {
        path: "borrow/detail/:id",
        component: () => import("@/components/borrows/BorrowDetail.vue"),
        name: "borrow.detail",
        meta: { requiresAuth: true, title: "Chi tiết phiếu mượn" },
      },

      // Trang đọc giả
      {
        path: "reader",
        component: () => import("@/components/readers/ReaderPage.vue"),
        name: "reader",
        meta: { requiresAuth: true, title: "Đọc giả" },
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
    return next("/book");
  }

  // Nếu chưa login mà vào trang nào cần requiresAuth → đẩy về login
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next("/login");
  }

  next();
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title}` : "Quản Lý VioBook";
});

export default router;
