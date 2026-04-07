<template>
  <div class="container">
    <div class="top">
      <span>{{ friendInfo.nickname }}</span>
    </div>

    <div class="content">
      <el-scrollbar ref="scrollRef">
        <div class="msg-wrapper">
          <div
            class="msg"
            :class="userInfo?.userId == item.senderId ? 'me' : 'other'"
            v-for="(item, index) in msgList"
            :key="index"
          >
            <img class="avatar" :src="friendInfo.avatar" />
            <div class="bubble">{{ item.content }}</div>
          </div>
        </div>
      </el-scrollbar>
    </div>
    <div class="send">
      <el-input 
        class="send-input" 
        v-model="sendContent"
        type="textarea" 
        :rows="4"
        @keydown.enter="sendMsg" />
      <el-button 
        class="send-btn" 
        type="primary"
        :disabled="!(sendContent.length > 0)"
        @click="sendMsg">发送</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { msgItem } from "@/types/friend"
import { io, Socket } from 'socket.io-client'
import { listen } from "@tauri-apps/api/event"
import { UserInfoStore } from "@/store/user/user.store"
import { FriendStore } from "@/store/friend/friend.store"
import { readMessage, getMessageList } from "@/api/message"
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue"

let socket: Socket | null = null
let unListen: (() => void) | null = null

const userStore = UserInfoStore()
const friendStore = FriendStore()
const userInfo = userStore.getUserInfo()[0]

const selectId = ref()
const sendContent = ref('')
const scrollRef = ref()
const conversationIdData = ref(0)

const friendInfo = ref({
  conversationId: 0,
  avatar: "",
  nickname: "",
})

const msgList = ref<msgItem[]>([])

const connectWebSocket = (conversationId: number) => {
  socket = io('http://192.168.127.1:3000', {
    query: {
      userId: userInfo?.userId
    }
  });

  socket.on('connect', () => {
    socket?.emit('join', { conversationId })
  });

  socket.on('newMessage', (msg) => {
    if (msg.conversationId === conversationIdData.value) {
      msgList.value.push(msg)
      nextTick(() => {
        scrollRef.value.setScrollTop(scrollRef.value.wrapRef.scrollHeight)
      })
    }
  });

  socket.on('conversationUpdate', () => {});
}

const sendMsg = async () => {
  if (!sendContent.value) return
  if (!socket) return

  if (userInfo) {
    const msg: msgItem = {
      conversationId: friendInfo.value.conversationId,
      senderId: userInfo.userId || 0,
      content: sendContent.value
    }
    socket.emit("sendMessage", msg)
    sendContent.value = ""
  }
}

const readMsg = () => {
  if (userInfo) {
    let uId = userInfo.userId || 0
    let cId = conversationIdData.value
    readMessage(uId, cId)
  }
}

const loadMessageList = async (cid: number) => {
  if (!cid) return
  try {
    getMessageList(cid).then((res: any) => {
      if (res.code == 200) {
        msgList.value = res.messageList
      }
    })

    if (socket) {
      socket.off('newMessage')
      socket.off('conversationUpdate')
      socket.disconnect()
    }
    connectWebSocket(cid)
    readMsg()
    friendStore.resetFriendListUnreadCount(selectId.value)

    nextTick(() => {
      scrollRef.value?.setScrollTop(scrollRef.value.wrapRef?.scrollHeight || 0)
    })
  } catch (err) {
    console.error('加载消息失败', err)
  }
}

watch(
  [() => friendStore.friendInfo, () => friendStore.selectId],
  async ([newFriendInfo, newSelectId]) => {
    if (!newFriendInfo || !newSelectId) return

    friendInfo.value = {
      conversationId: Number(newFriendInfo.conversationId) || 0,
      avatar: newFriendInfo.avatar || '',
      nickname: newFriendInfo.nickname || ''
    }
    selectId.value = newSelectId
    conversationIdData.value = friendInfo.value.conversationId

    await loadMessageList(conversationIdData.value)
  },
  { immediate: true }
)

onMounted(() => {
  listen('friend-info-update', (event: any) => {
    const payload = event.payload
    if (!payload) return

    friendInfo.value = {
      conversationId: Number(payload.friendInfo?.conversationId) || 0,
      avatar: payload.friendInfo?.avatar || '',
      nickname: payload.friendInfo?.nickname || ''
    }
    selectId.value = payload.selectId || 0
    conversationIdData.value = friendInfo.value.conversationId

    loadMessageList(conversationIdData.value)
  }).then(ul => unListen = ul)
})

onUnmounted(() => {
  if (unListen) unListen()
})
</script>

<style scoped>
.send-input :deep(.el-input__wrapper) {
  height: 100% !important;
  box-shadow: none !important;
  border: none !important;
  outline: none !important;
  background: transparent !important;
}

.send-input :deep(.el-input__wrapper:hover) {
  height: 100% !important;
  box-shadow: none !important;
  border: none !important;
  outline: none !important;
  background: transparent !important;
}

.send-input :deep(.el-input__wrapper.is-focus) {
  height: 100% !important;
  box-shadow: none !important;
  border: none !important;
  outline: none !important;
  background: transparent !important;
}

.send-input :deep(textarea) {
  height: 100% !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  background: transparent !important;
}

.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(to right, #d7f1ff, #f3f0ff);
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #cccccc;
  font-weight: 500;
  flex-shrink: 0;
}

:deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
}

.content {
  flex: 1;
  padding: 10px;
  overflow: hidden;
}

.msg-wrapper {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
}

.msg {
  display: flex;
  align-items: flex-start;
  margin-bottom: 15px;
  max-width: 70%;
  flex-shrink: 0;
}

.msg.other {
  flex-direction: row;
  margin-right: auto;
}

.msg.me {
  flex-direction: row-reverse;
  margin-left: auto;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.bubble {
  padding: 8px 12px;
  border-radius: 8px;
  background: #fff;
  margin: 0 8px;
  word-break: break-all;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.msg.me .bubble {
  background: #409eff;
  color: #fff;
}

.send {
  position: relative;
  height: 200px;
  border-top: 1px solid #cccccc;
}

.send-input {
  height: 100%;
  padding-right: 1px;
}

.send-btn {
  position: absolute;
  right: 10px;
  bottom: 10px;
}
</style>