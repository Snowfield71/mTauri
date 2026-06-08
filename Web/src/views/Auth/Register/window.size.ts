import { WindowConfigData } from "../../../types/auth";

export const RegisterWindowWidth = 400;
export const RegisterWindowHeight = 500;

export const registerConfig: WindowConfigData = {
  label: "register",
  title: "",
  width: RegisterWindowWidth,
  height: RegisterWindowHeight,
  resizable: false,
  maximizable: false,
  maximize: false,
  x: 500,
  y: 200,
  route: "/auth/register",
};
