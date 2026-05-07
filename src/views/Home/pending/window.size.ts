import { WindowConfigData } from "@/types/auth";

export const indexWindowWidth = 834;
export const indexWindowHeight = 608;

export const pendingConfig: WindowConfigData = {
  label: "pending",
  title: "",
  width: indexWindowWidth,
  height: indexWindowHeight,
  x: 700,
  y: 100,
  resizable: true,
  maximizable: true,
  route: "/pending",
  maximize: false,
};
