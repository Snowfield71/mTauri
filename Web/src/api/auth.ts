import request from "../util/request";
import {
  RegisterFormData,
  LoginFormData,
  VerifyPhone,
  TokenLogin,
  UpdateData,
} from "@/types/auth";

export const register = (data: RegisterFormData) => {
  return request.post("/auth/register", data);
};

export const login = (data: LoginFormData) => {
  return request.post("/auth/login", data);
};

export const verifyPhone = (data: VerifyPhone) => {
  return request.post("/auth/verify-phone", data);
};

export const tokenLogin = (data: TokenLogin) => {
  return request.post("/auth/token-login", data);
};

export const findPhone = (account: string) => {
  return request.post("/auth/find-phone", { account });
};

export const resetPassword = (phoneNumber: string, password: string) => {
  return request.post("/auth/reset-password", {
    phoneNumber: phoneNumber,
    password: password,
  });
};

export const uploadUserProfile = (data: UpdateData) => {
  const formData = new FormData();
  if (data.file) {
    formData.append("file", data.file);
  }

  formData.append("userId", String(data.userId));
  formData.append("nickname", data.nickname);
  formData.append("phoneNumber", data.phoneNumber);

  return request.post("/auth/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
