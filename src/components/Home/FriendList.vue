<template>
  <div class="list">
    <div class="top">
      <div class="search">
        <el-input
          class="search-input"
          v-model="keyword"
          placeholder="搜索"
          :prefix-icon="Search"
          @focus="handleFocus"
          @input="handleSearch"
        >
          <template #suffix>
            <el-icon v-if="keyword" @click="clearKeyword">
              <Close />
            </el-icon>
          </template>
        </el-input>
      </div>
      <el-button class="add-btn" :icon="Plus" @click="createWindow('add')" />
    </div>
    <div class="notification" @click="createWindow('pending')">
      <span>好友通知</span>
      <div v-if="pendingCount" class="pending-count">
        {{ pendingCount }}
      </div>
      <el-icon><ArrowRight /></el-icon>
    </div>

    <el-scrollbar class="scrollbar">
      <template v-if="isSearch">
        <div
          v-if="searchResult.length > 0"
          v-for="(item, index) in searchResult"
          :key="item.conversationId || index"
          class="content-list"
          @click="handleItemClick(item, item.targetUserId)"
        >
          <img class="avatar" :src="item.avatar" />
          <div class="content">
            <span>{{ item.nickname }}</span>
            <span>{{ item.lastMessage }}</span>
          </div>
          <div class="meta">
            <span>{{ item.lastTime || '' }}</span>
            <el-tag
              class="count"
              type="info"
              v-if="item.unreadCount !== 0"
            >
              {{ item.unreadCount >= 99 ? '99+' : item.unreadCount }}
            </el-tag>
          </div>
        </div>
        <div v-else class="empty-result">
          暂无搜索结果
        </div>
      </template>
      
      <template v-else>
        <div
          v-for="(item, index) in friendList"
          :key="item.conversationId || index"
          class="content-list"
          @click="handleItemClick(item, item.targetUserId)"
          @contextmenu="open(item, index)"
        >
          <img class="avatar" :src="item.avatar" />
          <div class="content">
            <span>{{ item.nickname }}</span>
            <span>{{ item.lastMessage }}</span>
          </div>
          <div class="meta">
            <span>{{ item.lastTime }}</span>
            <el-tag
              class="count"
              type="info"
              v-if="item.unreadCount !== 0"
            >
              {{ item.unreadCount >= 99 ? '99+' : item.unreadCount }}
            </el-tag>
          </div>
        </div>
      </template>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { debounce } from '@/util'
import { baseURL } from '@/util/request'
import { deleteFriend as apiDeleteFriend, getPendingFriendList } from '@/api/friend'
import { io, Socket } from 'socket.io-client'
import { invoke } from '@tauri-apps/api/core'
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { deleteConversation } from '@/api/conversation'
import { emit, listen } from "@tauri-apps/api/event"
import { ElMessage, ElMessageBox } from 'element-plus'
import { getConversationList } from '@/api/conversation'
import type { FriendListItem } from '../../types/friend'
import { addConfig } from '@/views/Home/add/window.size'
import { FriendStore } from '@/store/friend/friend.store'
import { UserInfoStore } from '../../store/user/user.store'
import { pendingConfig } from '@/views/Home/pending/window.size'
import { Search, Plus, Close, ArrowRight } from '@element-plus/icons-vue'

const userStore = UserInfoStore()
const friendStore = FriendStore()

const userInfo = ref()
const keyword = ref('')
const pendingCount = ref(0)
const isSearch = ref(false)

const friendList = computed(() => friendStore.friendList)

const searchResult = ref<FriendListItem[]>([])

let socket: Socket | null = null

const connectWebSocket = () => {
  socket = io(baseURL, {
    query: {
      userId: userInfo.value.userId
    }
  })

  socket.on('friendApplyReceived', () => {
    emit('refresh-pending-list')
    getPendingLists()
  })

  socket.on('friendListUpdate', () => {
    getFriendList()
  })

  socket.on('pendingApplyUpdate', () => {
    getPendingLists()
  })
}

const search = () => {
  const key = keyword.value.trim().toLowerCase()

  if (!key) {
    searchResult.value = []
    isSearch.value = false 
    return
  }

  isSearch.value = true
  searchResult.value = friendList.value.filter((item: FriendListItem) => {
    const nickname = item.nickname?.toLowerCase() || ''
    const account = item.account?.toLowerCase() || ''
    const lastMessage = item.lastMessage?.toLocaleLowerCase() || ''
    return nickname.includes(key) || account.includes(key) || lastMessage.includes(key)
  })
}

const deleteFriend = (friendListItem: FriendListItem, index: number) => {
  const fId = friendListItem.targetUserId
  const cId = friendListItem.conversationId
  
  apiDeleteFriend(fId).then((res: any) => {
    if (res.code == 200) {
      deleteConversation(fId, cId).then((cRes: any) => {
        if (cRes.code == 200) {
          ElMessage.success('删除成功')
          friendStore.deleteFriendByIndex(index)
          getFriendList()

          friendStore.clearFriendInfo()
          emit('delete-friend')
        }
      })
    }
  })
}

const open = (item: FriendListItem, index: number) => {
  let nickname = item.nickname
  ElMessageBox.confirm(
    `是否删除好友${nickname}?`,
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      deleteFriend(item, index)
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消',
      })
    })
}

const handleSearch = debounce(search, 500)

const handleFocus = () => {
  if (keyword.value.trim()) {
    isSearch.value = true
    search()
  }
}

const clearKeyword = () => {
  keyword.value = ''
  isSearch.value = false
  searchResult.value = []
}

const handleItemClick = (item: FriendListItem, id: number) => { 
  isSearch.value = false
  keyword.value = ''
  searchResult.value = []
  
  friendStore.setSelectedId(id)
  friendStore.setFriendInfo(item)
}

const getPendingLists = () => {
  getPendingFriendList().then((res: any) => {
    if (res.code == 200) {
      pendingCount.value = res.data.length
    }
  })
}

const getFriendList = async () => {
  try {
    getConversationList().then((res: any) => {
      if (res.code === 200) {
        res.data.forEach((item: FriendListItem) => {
          if (item.lastTime) {
            const date = new Date(item.lastTime)
            const hours = date.getHours().toString().padStart(2, '0')
            const minutes = date.getMinutes().toString().padStart(2, '0')
            item.lastTime = `${hours}:${minutes}`
          }
        })
        friendStore.setFriendList(res.data)
      }
    })
  } catch (e) {
    console.error('获取好友列表失败:', e)
  }
}

const createWindow = async(type: string) => {
  try {
    if (type == 'add') {
      await invoke('create_window', { config: addConfig })
    }
    else if (type == 'pending') {
      await invoke('create_window', { config: pendingConfig })
    }

  } catch (err) {
    console.error('操作失败:', err)
  }
}

onMounted(async () => {
  const userList = await userStore.getUserInfo()
  const user = userList?.[0]
  if (user) {
    userInfo.value = user
    getFriendList()
    getPendingLists()
    connectWebSocket()
  }

  listen('refresh-friend-list', (event: any) => {
    getFriendList()

    if (event) {
      let friendId = event.payload.friendId;

      let targetIndex = -1;
      let targetUser = null;

      for (let i = 0; i < friendList.value.length; i++) {
        let item = friendList.value[i];
        
        if (item.targetUserId === friendId) {
          targetUser = item;
          targetIndex = i;
          break;
        }
      }

      if (targetIndex !== -1 && targetUser !== null) {
        friendList.value.splice(targetIndex, 1);
        friendList.value.unshift(targetUser);
      }
    }
  })

  listen('refresh-pending-list', () => {
    getPendingLists()
  })

  listen('new-last-message', (event: any) => {
    let content = event.payload
    let account = friendStore.friendInfo.account

    let targetItem = null
    let targetIndex = -1

    for (let i = 0; i < friendList.value.length; i++) {
      let item = friendList.value[i]
      if (item.account === account) {
        const date = new Date();
        const hours = date.getHours().toString().padStart(2, '0');

        item.lastMessage = content
        item.lastTime = `${hours}:00`;
        
        targetItem = item
        targetIndex = i
        break
      }
    }

    if (targetItem !== null && targetIndex !== -1) {
      friendList.value.splice(targetIndex, 1)
      friendList.value.unshift(targetItem)
    }
  })
})

onUnmounted(() => {
  if (socket) {
    socket.off('friendApplyReceived')
    socket.off('friendListUpdate')
    socket.off('pendingApplyUpdate')
    socket.disconnect()
    socket = null
  }
})
</script>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.top {
  display: flex;
  justify-content: space-between;
  flex-shrink: 0;
  margin: 10px;
  gap: 5px;
}

.scrollbar {
  flex: 1;
  width: 240px;
}

.scrollbar :deep(.el-scrollbar__wrap) {
  overflow-x: hidden;
  overflow-y: auto;
}

.search {
  width: 90%;
}

.search :deep(.el-input__wrapper) {
  background-color: #f5f5f5;
  box-shadow: none;
}

.search :deep(.el-input__wrapper.is-focus) {
  background-color: #fff;
}

.pending-count {
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  color: white;
  width: 20px;
  height: 20px;
  background-color: red;
}

.add-btn {
  width: 28px;
  background-color: #f5f5f5;
}

.content-list {
  display: flex;
  align-items: center;
  height: 50px;
  padding: 10px;
  cursor: pointer;
}

.content-list:hover {
  background-color: #f5f5f5;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.content {
  flex: 1;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.content span {
  font-size: 14px;
  width: 100%;
}

.count {
  width: 40px;
}

.empty-result {
  text-align: center;
  padding: 40px;
  color: #909399;
}

.notification {
  display: flex;
  align-items: center;
  padding: 10px;
  height: 20px;
  cursor: pointer;
}

.notification span {
  flex: 1;
}

.notification:hover {
  color: #000000;
  background-color: #f5f5f5;
}
</style>