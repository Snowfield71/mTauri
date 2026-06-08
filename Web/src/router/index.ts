import { createRouter, createWebHashHistory } from "vue-router";
import { UserInfoStore } from "@/store/user/user.store";

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: "/",
      redirect: "/auth",
    },
    {
      name: "Auth",
      path: "/auth",
      component: () => import("../views/Auth/index.vue"),
      children: [
        {
          path: "",
          redirect: { name: "Default" },
          name: "AuthHome",
        },
        {
          name: "Default",
          path: "default",
          meta: { requiresAuth: true },
          component: () => import("../views/Auth/Default/index.vue"),
        },
        {
          name: "Login",
          path: "login",
          component: () => import("../views/Auth/Login/index.vue"),
        },
        {
          name: "Register",
          path: "register",
          component: () => import("../views/Auth/Register/index.vue"),
        },
        {
          name: "ForgetPwd",
          path: "forgetPwd",
          component: () => import("../views/Auth/ForgetPwd/index.vue"),
        },
        {
          name: "FindMethods",
          path: "findMethods",
          component: () => import("../views/Auth/FindMethods/index.vue"),
        },
        {
          name: "PhoneMethod",
          path: "phoneMethod",
          component: () => import("../views/Auth/PhoneMethod/index.vue"),
        },
        {
          name: "ResetPwd",
          path: "resetPwd",
          component: () => import("../views/Auth/ResetPwd/index.vue"),
        },
      ],
    },
    {
      name: "Home",
      path: "/home",
      component: () => import("../views/Home/Home/index.vue"),
    },
    {
      name: "Add",
      path: "/add",
      component: () => import("../views/Home/add/index.vue"),
    },
    {
      name: "Pending",
      path: "/pending",
      component: () => import("../views/Home/pending/index.vue"),
    },
  ],
});

router.beforeEach((to, from, next) => {
  from;
  const store = UserInfoStore();
  
  const hasStoredAccountWithToken = store.accountList.some(account => account.token);
  const isLoggedIn = !!store.token;

  if (to.name === 'Default') {
    if (hasStoredAccountWithToken || isLoggedIn) {
      next();
    } else {
      next({ name: "Login" });
    }
  } else if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: "Login", query: { redirect: to.fullPath } });
  } else if (to.path === '/' || to.name === 'AuthHome') {
    if (hasStoredAccountWithToken || isLoggedIn) {
      next({ name: "Default" });
    } else {
      next({ name: "Login" });
    }
  } else {
    next();
  }
});

export default router;