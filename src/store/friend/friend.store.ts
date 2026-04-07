import { defineStore } from "pinia";
import type { friendInfo } from "./friend.type";
import type { friendListItem } from "@/types/friend";

export const FriendStore = defineStore("friendList", {
  state: () => ({
    friendList: [] as friendListItem[],
    friendInfo: {} as friendInfo,
    selectId: 0,
  }),
  actions: {
    setSelectId(id: number) {
      this.selectId = id;
    },
    setFriendInfo(info: friendInfo) {
      this.friendInfo = info;
    },
    setFriendList(item: friendListItem[]) {
      this.friendList = item;
    },
    getFriendInfo(id: number) {
      let friendListItem = this.friendList.find(
        (item) => item.targetUserId == id,
      );
      return friendListItem;
    },
    resetFriendListUnreadCount(id: number) {
      let friendListItem = this.friendList.find(
        (item) => item.targetUserId == id,
      );
      if (friendListItem) {
        friendListItem.unreadCount = 0;
      }
    },
    deleteFriendByIndex(index: number) {
      this.friendList.splice(index, 1);
    },
  },
  persist: true,
});
