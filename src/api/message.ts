import request from "@/util/request";
import { SendMessageData } from "@/types/message";

export const sendMessage = (data: SendMessageData) => {
  return request.post("/message/send", data);
};

export const getMessageList = (conversationId: number) => {
  return request.get("/message/list", {
    params: {
      conversationId,
    },
  });
};

export const readMessage = (conversationId: number) => {
  return request.post("/message/read", {
    conversationId,
  });
};

export const clearMessage = (conversationId: number) => {
  return request.post("/message/clear", {
    conversationId,
  });
};
