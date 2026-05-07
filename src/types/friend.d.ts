export type FriendListItem = {
  conversationId: number;
  targetUserId: number;
  nickname: string;
  avatar: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
  account: string;
};

export type MsgItem = {
  id?: number;
  conversationId: number;
  senderId: number;
  content: string;
  status?: number;
  createdAt?: string;
};

export type FriendListResponse = { data: FriendListItem[] };

export type SearchListItem = {
  id: number;
  account: string;
  nickname: string;
  avatar: string;
  isAdded?: boolean;
};

export type PendingListItem = {
  id: number;
  account: string;
  nickname: string;
  avatar: string;
};
