import { defineStore } from "pinia";
import type { UserInfoData } from "@/store/user/user.type";

const ACCOUNT_LIST_KEY = 'account_list';

const loadAccountList = (): UserInfoData[] => {
  try {
    const data = localStorage.getItem(ACCOUNT_LIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveAccountList = (accounts: UserInfoData[]) => {
  try {
    localStorage.setItem(ACCOUNT_LIST_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.error('Failed to save account list:', e);
  }
};

export const UserInfoStore = defineStore("userInfo", {
  state: () => ({
    userInfo: [] as UserInfoData[],
    token: "",
    isRegister: false,
    windowUserId: "",
  }),
  persist: true,
  actions: {
    setIsRegister(isRegister: boolean) {
      this.isRegister = isRegister;
    },
    
    setUserInfo(data: UserInfoData) {
      const index = this.userInfo.findIndex(
        (item) => item.userId === data.userId,
      );
      if (index !== -1) {
        const oldData = this.userInfo[index];
        this.userInfo[index] = { ...oldData, ...data };
      } else {
        this.userInfo.unshift(data);
      }
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
      if (index >= 0 && index < this.userInfo.length) {
        this.userInfo.splice(index, 1);
      }
    },
    
    deleteAccountFromList(index: number) {
      if (index >= 0 && index < this.accountList.length) {
        this.accountList.splice(index, 1);
        saveAccountList(this.accountList);
      }
    },
    
    setWindowUserId(userId: string) {
      this.windowUserId = userId;
    },
    
    getWindowUserId() {
      return this.windowUserId;
    },
    
    clearAll() {
      this.userInfo = [];
      this.token = "";
      this.isRegister = false;
      this.windowUserId = "";
    },
  },
});
