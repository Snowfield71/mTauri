import request from "../util/request";

export const createConversation = (userId: number, targetUserId: number) => {
  return request.post("/conversation/create", {
    userId: userId,
    targetUserId: targetUserId,
  });
};

export const getConversationList = (userId: number) => {
  return request.get("/conversation/list", {
    params: {
      userId: userId,
    },
  });
};

export const delConversation = (
  userId: number,
  targetUserId: number,
  conversationId: number,
) => {
  return request.delete("/conversation/delete", {
    params: {
      userId: userId,
      targetUserId: targetUserId,
      conversationId: conversationId,
    },
  });
};
