import request from "../util/request";

export const createConversation = (targetUserId: number) => {
  return request.post("/conversation/create", {
    targetUserId,
  });
};

export const getConversationList = () => {
  return request.get("/conversation/list");
};

export const deleteConversation = (targetUserId: number, conversationId: number) => {
  return request.delete("/conversation/delete", {
    params: {
      targetUserId,
      conversationId,
    },
  });
};
