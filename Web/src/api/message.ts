import request from "@/util/request";
import { SendMessageData } from "@/types/message";

export const sendMessage = (data: SendMessageData) => {
  return request.post("/message/send", data);
};

export const getMessageList = (conversationId: number, userId: number) => {
  return request.get("/message/list", {
    params: {
      conversationId: conversationId,
      userId: userId,
    },
  });
};

export const readMessage = (userId: number, conversationId: number) => {
  return request.post("/message/read", {
    userId: userId,
    conversationId: conversationId,
  });
};

export const clearMessage = (userId: number, conversationId: number) => {
  return request.post("/message/clear", {
    userId: userId,
    conversationId: conversationId,
  });
};
