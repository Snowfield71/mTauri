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

    accountList: loadAccountList() as UserInfoData[],
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
        const oldData = this.userInfo[index];
        this.userInfo[index] = { ...oldData, ...data };
      } else {
        this.userInfo.unshift(data);
      }

      const accountIndex = this.accountList.findIndex(
        (item) => item.userId === data.userId,
      );
      if (accountIndex !== -1) {
        this.accountList.splice(accountIndex, 1);
      }
      this.accountList.unshift(data);

      saveAccountList(this.accountList);
    },

    getUserInfo(): UserInfoData[] {
      return this.userInfo;
    },

    getAccountList(): UserInfoData[] {
      return this.accountList;
    },

    setToken(token: string) {
      this.token = token;
      
      if (this.userInfo.length > 0) {
        const currentUser = this.userInfo[0];
        const accountIndex = this.accountList.findIndex(
          (item) => item.userId === currentUser.userId,
        );
        if (accountIndex !== -1) {
          this.accountList[accountIndex] = { 
            ...this.accountList[accountIndex], 
            token 
          };
          saveAccountList(this.accountList);
        }
      }
    },

    getToken() {
      return this.token;
    },

    getTokenByUserId(userId: number): string {
      const account = this.accountList.find(item => item.userId === userId);
      return account?.token || "";
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