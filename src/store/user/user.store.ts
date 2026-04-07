import { defineStore } from "pinia";
import type { UserInfoData } from "@/store/user/user.type";

export const UserInfoStore = defineStore("userInfo", {
  state: () => ({
    userInfo: [] as UserInfoData[],
    token: "",
    isRegister: false,
  }),

  actions: {
    setIsRegister(isRegister: boolean) {
      this.isRegister = isRegister;
    },

    setUserInfo(data: UserInfoData) {
      const index = this.userInfo.findIndex(
        (item) => item.userId === data.userId,
      );
      if (index !== -1) {
        this.userInfo.splice(index, 1);
      }
      this.userInfo.unshift(data);
    },

    getUserInfo(): UserInfoData[] {
      return this.userInfo;
    },

    setToken(token: string) {
      this.token = token;
    },

    getToken() {
      return this.token;
    },

    deleteUserInfo(index: number) {
      this.userInfo.splice(index, 1);
    },
  },

  persist: true,
});
