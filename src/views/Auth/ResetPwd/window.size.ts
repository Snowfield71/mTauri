import { WindowConfigData } from "../../../types/auth";

export const registerConfig: WindowConfigData = {
  label: "authResetPwd",
  title: "注册",
  width: 400,
  height: 400,
  resizable: false,
  maximizable: false,
  route: "/auth/resetPwd",
  disableContextMenu: true,
};
