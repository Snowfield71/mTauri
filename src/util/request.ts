import axios from "axios";
import { UserInfoStore } from "@/store/user/user.store";
import router from "@/router/index";

const request = axios.create({
  baseURL: "http://192.168.2.4:3000",
  timeout: 10000,
});

const publicPaths = [
  "/auth/register",
  "/auth/login",
  "/auth/token-login",
  "/auth/verify-phone",
  "/auth/reset-password",
  "/auth/update",
];

request.interceptors.request.use(
  (config) => {
    const url = config.url || "";
    
    if (!publicPaths.some((path) => url.includes(path))) {
      const store = UserInfoStore();
      const token = store.token;
      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 200 || res.code === 201 || res.code === 409) {
      return res;
    } else {
      ElMessage.warning(res.message || "请求失败");
      return Promise.reject(res);
    }
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        ElMessage.warning("登录已过期，请重新登录");
        const store = UserInfoStore();
        store.setToken("");
        router.push({ name: "Login" });
      } else if (status === 403) {
        ElMessage.warning("暂无权限访问");
      } else if (status === 404) {
        ElMessage.warning("接口不存在");
      } else if (status >= 500) {
        ElMessage.warning("服务器内部错误");
      } else {
        const message = error.response.data?.message || "请求失败";
        ElMessage.warning(message);
      }
    } else if (error.request) {
      ElMessage.warning("请求超时或网络异常");
    } else {
      ElMessage.warning("请求配置错误");
    }
    
    return Promise.reject(error);
  },
);

export default request;
