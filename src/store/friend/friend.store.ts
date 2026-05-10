import { defineStore } from "pinia";
import type { FriendInfo } from "./friend.type";
import type { FriendListItem } from "@/types/friend";

export const FriendStore = defineStore("friendList", {
  state: () => ({
    friendList: [] as FriendListItem[],
    friendInfo: {} as FriendInfo,
    selectedId: 0,
  }),
  actions: {
    setSelectedId(id: number) {
      this.selectedId = id;
    },
    setFriendInfo(info: FriendInfo) {
      this.friendInfo = info;
    },
    setFriendList(items: FriendListItem[]) {
      this.friendList = items;
    },
    getFriendInfo(id: number) {
      const friendItem = this.friendList.find(
        (item) => item.targetUserId === id,
      );
      return friendItem;
    },
    resetFriendListUnreadCount(id: number) {
      const friendItem = this.friendList.find(
        (item) => item.targetUserId === id,
      );
      if (friendItem) {
        friendItem.unreadCount = 0;
      }
    },
    deleteFriendByIndex(index: number) {
      this.friendList.splice(index, 1);
    },
    clearFriendInfo() {
      this.friendInfo = {} as FriendInfo;
      this.selectedId = 0;
      
      const currentData = localStorage.getItem('friendList');
      if (currentData) {
        try {
          const parsed = JSON.parse(currentData);
          parsed.friendInfo = {};
          parsed.selectedId = 0;
          localStorage.setItem('friendList', JSON.stringify(parsed));
        } catch (e) {
          console.error('Failed to update localStorage:', e);
        }
      }
    },
  },
  persist: true,
});
