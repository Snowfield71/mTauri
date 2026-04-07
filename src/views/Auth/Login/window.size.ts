import { WindowConfigData } from "../../../types/auth";

export const LoginWindowWidth = 315;
export const LoginWindowHeight = 400;

export const loginConfig: WindowConfigData = {
  label: "login",
  title: "用户登录",
  width: LoginWindowWidth,
  height: LoginWindowHeight,
  x: 700,
  y: 240,
  maximize: false,
  resizable: false,
  maximizable: false,
  route: "/auth/login",
};
