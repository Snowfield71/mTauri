import { defineStore } from "pinia";
import type { friendInfo } from "./friend.type";
import type { FriendListItem } from "@/types/friend";

export const FriendStore = defineStore("friendList", {
  state: () => ({
    friendList: [] as FriendListItem[],
    friendInfo: {} as friendInfo,
    selectedId: 0,
  }),
  actions: {
    setSelectedId(id: number) {
      this.selectedId = id;
    },
    setFriendInfo(info: friendInfo) {
      this.friendInfo = info;
    },
    setFriendList(items: FriendListItem[]) {
      this.friendList = items;
    },
    getFriendInfo(id: number) {
      return this.friendList.find((item) => item.targetUserId === id);
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
      this.friendInfo = {} as friendInfo;
      this.selectedId = 0;
    },
  },
});
