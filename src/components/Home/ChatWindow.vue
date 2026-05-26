<template>
  <div class="container" @click="handleClickOutside" v-if="friendInfo && friendInfo.nickname">
    <div class="top">
      <span>{{ friendInfo.nickname }}</span>
      <el-icon @click.stop="drawerVisible=true">
        <MoreFilled />
      </el-icon>
    </div>

    <div class="content">
      <el-scrollbar ref="scrollRef">
        <div class="msg-wrapper">
          <el-drawer
            direction="rtl"
            v-model="drawerVisible"
            :modal="false"
            :show-close="false"
            custom-class="chat-right-drawer"
            :with-header="false"
            style="position: absolute; top: 56px; height: calc(100vh-56px); background-color: #f2f2f2;"
            size="300px"
            @click.stop
          >
            <template #default>
              <div class="drawer-group">
                <div>
                  <el-button class="drawer-btn" @click="open('msg', '聊天记录')">删除聊天记录</el-button>
                </div>
                <el-button class="drawer-btn" type="danger" @click="open('friend', '好友')">删除好友</el-button>
              </div>
            </template>
          </el-drawer>

          <div
            class="msg"
            :class="userInfo?.userId == item.senderId ? 'me' : 'other'"
            v-for="(item, index) in msgList"
            :key="index"
          >
            <img 
              class="avatar" 
              :src="userInfo?.userId == item.senderId ? userInfo.avatar : friendInfo.avatar" 
              alt="avatar" />
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
        :placeholder="canSend ? '请输入内容，按 Enter 发送' : '对方已将你删除，无法发送消息'"
        :disabled="!canSend"
        @keydown.enter.exact.prevent="sendMsg"
        @keydown.ctrl.enter="(e) => {
          sendContent += '\n'
          e.preventDefault()
        }"
      />
      <el-button 
        class="send-btn" 
        type="primary"
        :disabled="!(sendContent.trim().length > 0) || !canSend"
        @click="sendMsg">发送</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { deleteFriend as apiDeleteFriend } from "@/api/friend"
import { baseURL } from '@/util/request'
import type { MsgItem } from "@/types/friend"
import { io, Socket } from 'socket.io-client'
import { emit, listen } from "@tauri-apps/api/event"
import { MoreFilled } from "@element-plus/icons-vue"
import { UserInfoStore } from "@/store/user/user.store"
import { FriendStore } from "@/store/friend/friend.store"
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from "vue"
import { readMessage, getMessageList, clearMessage } from "@/api/message"
import { ElMessage, ElMessageBox } from 'element-plus'

let socket: Socket | null = null
let unListen: (() => void) | null = null

const userStore = UserInfoStore()
const friendStore = FriendStore()

const drawerVisible = ref(false)

const selectId = ref()
const sendContent = ref('')
const scrollRef = ref()
const conversationIdData = ref(0)

const userInfo = computed(() => userStore.getUserInfo()[0])

const friendInfo = computed(() => friendStore.friendInfo)

const isBlockedByFriend = ref(false)

const canSend = computed(() => !isBlockedByFriend.value && friendStore.friendInfo.canSend !== false)

const msgList = ref<MsgItem[]>([])

const handleDeleteFriend = () => {
  const fId = friendStore.selectedId
  apiDeleteFriend(fId).then((res: any) => {
    if (res.code == 200) {
      ElMessage.success('删除成功')
      emit('refresh-friend-list')
      friendStore.clearFriendInfo()
      msgList.value = []
      
      if (socket) {
        socket.off('connect')
        socket.off('newMessage')
        socket.off('conversationUpdate')
        socket.disconnect()
        socket = null
      }
    }
  })
}

const clearMsg = () => {
  const currentUser = userInfo.value
  if (!currentUser) return
  
  const cId = friendStore.friendInfo.conversationId
  if (!cId) return
  
  clearMessage(currentUser.userId || 0, cId).then((res: any) => {
    if (res.code == 200) {
      ElMessage.success('删除成功')
      msgList.value = []
    }
  })
}

const open = (type: string, content: string) => {
  ElMessageBox.confirm(
    `是否删除${content}?`,
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      if (type == 'msg') {
        clearMsg()
      } else {
        handleDeleteFriend()
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消',
      })
    })
}

const connectWebSocket = (conversationId: number) => {
  const currentUser = userInfo.value
  if (!currentUser) {
    console.warn('用户信息不存在，无法连接 WebSocket')
    return
  }
  
  socket = io(baseURL, {
    query: {
      userId: currentUser.userId
    }
  })

  socket.on('connect', () => {
    console.log('WebSocket 已连接')
    socket?.emit('join', { conversationId })
  })

  socket.on('disconnect', () => {
    console.log('WebSocket 已断开')
  })

  socket.on('newMessage', (msg) => {
    if (msg.conversationId === conversationIdData.value) {
      msgList.value.push(msg)
      emit('new-last-message', msg.content)
      nextTick(() => {
        if (scrollRef.value && scrollRef.value.wrapRef) {
          scrollRef.value.setScrollTop(scrollRef.value.wrapRef.scrollHeight)
        }
      })
    }
  })

  socket.on('conversationUpdate', () => {})
}

const handleClickOutside = () => {
  if (drawerVisible.value) {
    drawerVisible.value = false
  }
}

const sendMsg = () => {
  if (!canSend.value) {
    ElMessage.warning('对方已将你删除，无法发送消息')
    return
  }
  
  if (!sendContent.value.trim()) return
  
  const currentUser = userInfo.value
  if (!currentUser) {
    ElMessage.warning('用户信息不存在')
    return
  }
  
  if (!socket) {
    ElMessage.warning('连接已断开，请重新选择好友')
    return
  }
  
  if (!friendInfo.value.conversationId) {
    ElMessage.warning('请先选择好友')
    return
  }

  const msg: MsgItem = {
    conversationId: friendInfo.value.conversationId,
    senderId: currentUser.userId || 0,
    content: sendContent.value
  }
  
  socket.emit("sendMessage", msg)
  
  sendContent.value = ""
}

const readMsg = () => {
  const currentUser = userInfo.value
  if (currentUser) {
    const cId = conversationIdData.value
    readMessage(currentUser.userId || 0, cId)
  }
}

const loadMessageList = async (cid: number) => {
  if (!cid) return
  const currentUser = userInfo.value
  if (!currentUser) return
  
  try {
    getMessageList(cid, currentUser.userId || 0).then((res: any) => {
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
  [() => friendStore.friendInfo, () => friendStore.selectedId],
  async ([newFriendInfo, newSelectId]) => {
    if (!newFriendInfo || !newSelectId) {
      msgList.value = []
      return
    }

    isBlockedByFriend.value = false
    
    selectId.value = newSelectId
    conversationIdData.value = newFriendInfo.conversationId

    await loadMessageList(conversationIdData.value)
  },
  { immediate: true }
)

onMounted(() => {
  listen('friend-info-update', (event: any) => {
    const payload = event.payload
    if (!payload || !payload.friendInfo) {
      msgList.value = []
      return
    }
    friendStore.setSelectedId(payload.selectedId || 0)
    friendStore.setFriendInfo(payload.friendInfo)
  }).then(ul => unListen = ul)

  listen('delete-friend', () => {
    msgList.value = []
  })

  listen('conversationListUpdate', () => {})
  
  listen('friendRemoved', (event: any) => {
    const payload = event.payload
    if (!payload || !payload.fromUserId) {
      return
    }
    
    const currentFriendId = friendStore.friendInfo.targetUserId
    
    if (currentFriendId && payload.fromUserId === currentFriendId) {
      isBlockedByFriend.value = true
      ElMessage.warning('对方已将你删除，无法发送消息')
    }
  })
})

onUnmounted(() => {
  if (unListen) unListen()
  
  if (socket) {
    socket.off('connect')
    socket.off('newMessage')
    socket.off('conversationUpdate')
    socket.disconnect()
    socket = null
  }
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

.drawer-btn {
  margin-top: 20px;
  width: 100%;
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

.msg.me {
  margin-left: auto;
  flex-direction: row-reverse;
}

.msg.me .bubble {
  background: #409eff;
  color: #fff;
}

.msg.other {
  margin-right: auto;
  justify-content: flex-start;
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
