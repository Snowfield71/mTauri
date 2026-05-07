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
    },
  },
  persist: true,
});
