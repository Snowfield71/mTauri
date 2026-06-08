import { WindowConfigData } from "@/types/auth";

export const indexWindowWidth = 834;
export const indexWindowHeight = 608;

export const createHomeConfig = (userInfo?: { token: string; userId: string; account: string; avatar: string; nickname: string }): WindowConfigData => {
  const userDataStr = userInfo ? encodeURIComponent(JSON.stringify(userInfo)) : undefined;
  
  return {
    label: "home",
    title: "",
    width: indexWindowWidth,
    height: indexWindowHeight,
    x: 700,
    y: 100,
    resizable: true,
    maximizable: true,
    route: userDataStr ? `/home?userData=${userDataStr}` : "/home",
    maximize: true,
  };
};

export const homeConfig: WindowConfigData = {
  label: "home",
  title: "",
  width: indexWindowWidth,
  height: indexWindowHeight,
  x: 700,
  y: 100,
  resizable: true,
  maximizable: true,
  route: "/home",
  maximize: true,
};
