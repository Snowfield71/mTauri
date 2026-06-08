import request from "@/util/request";

export const getFriendList = () => {
  return request.get("/friend/list");
};

export const rejectFriendRequest = (friendId: number) => {
  return request.post("/friend/reject", {
    friendId,
  });
};

export const agreeFriendRequest = (friendId: number) => {
  return request.post("/friend/agree", {
    friendId,
  });
};

export const getPendingFriendList = () => {
  return request.get("/friend/pending-list");
};

export const applyFriend = (friendId: number) => {
  return request.post("/friend/apply", {
    friendId,
  });
};

export const deleteFriend = (friendId: number) => {
  return request.delete("/friend/delete", {
    params: {
      friendId,
    },
  });
};

export const searchFriend = (keyword: string) => {
  return request.get("/friend/search", {
    params: {
      keyword,
    },
  });
};
