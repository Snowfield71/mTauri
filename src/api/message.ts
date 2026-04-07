import request from "@/util/request";
import { SendMessageData } from "@/types/message";

export const sendMessage = (data: SendMessageData) => {
  return request.post("/message/send", data);
};

export const getMessageList = (conversationId: number) => {
  return request.get("/message/list", {
    params: {
      conversationId: conversationId,
    },
  });
};

export const readMessage = (userId: number, conversationId: number) => {
  return request.post("/message/read", {
    userId: userId,
    conversationId: conversationId,
  });
};
