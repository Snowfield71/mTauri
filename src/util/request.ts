import axios from "axios";

const request = axios.create({
  baseURL: "http://192.168.127.1:3000",
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

request.interceptors.response.use(
  (response) => {
    const res = response.data;
    if (res.code === 200 || res.code == 201 || res.code == 409) {
      return res;
    } else {
      ElMessage.error(res.message || "请求失败");
      return Promise.reject(res);
    }
  },
  (error) => {
    ElMessage.error(error.message || "网络错误");
    return Promise.reject(error);
  },
);

export default request;
