import type { WindowConfigData } from "../../../types/auth";

export const forgetPwdConfig: WindowConfigData = {
  label: "forgetPwd",
  title: "忘记密码",
  width: 400,
  height: 400,
  x: 800,
  y: 200,
  maximize: false,
  resizable: false,
  maximizable: false,
  route: "/auth/forgetPwd",
  disableContextMenu: true,
};
