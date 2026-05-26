import { WindowConfigData } from "@/types/auth";

export const indexWindowWidth = 678;
export const indexWindowHeight = 718;

export const addConfig: WindowConfigData = {
  label: "add",
  title: "",
  width: indexWindowWidth,
  height: indexWindowHeight,
  x: 700,
  y: 100,
  resizable: true,
  maximizable: true,
  route: "/add",
  maximize: false,
};

export const createAddConfig = (userData: { token: string; userId: string; account: string; avatar: string }): WindowConfigData => {
  return {
    ...addConfig,
    label: `add`,
    route: `/add?userData=${encodeURIComponent(JSON.stringify(userData))}`
  }
};
