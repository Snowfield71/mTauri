import request from "@/util/request";

export const getFriendList = (userId: number) => {
  return request.get("/friend/list", {
    params: {
      userId: userId,
    },
  });
};

export const addFriend = (userId: number, friendId: number) => {
  return request.post("/friend/add", {
    userId: userId,
    friendId: friendId,
  });
};

export const delFriend = (userId: number, friendId: number) => {
  return request.delete("/friend/delete", {
    params: {
      userId: userId,
      friendId: friendId,
    },
  });
};

export const searchFriend = (keyword: string) => {
  return request.get("/friend/search", {
    params: {
      keyword: keyword,
    },
  });
};
