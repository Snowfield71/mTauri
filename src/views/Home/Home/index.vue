<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Sidebar from '@/components/Home/Sidebar.vue'
import FriendList from '@/components/Home/FriendList.vue'
import ChatWindow from '@/components/Home/ChatWindow.vue'
import { UserInfoStore } from '@/store/user/user.store'

const store = UserInfoStore()

interface WindowUserData {
  token: string
  userId: string
  account: string
  avatar: string
}

const currentUser = ref<WindowUserData | null>(null)

const cleanupOnClose = () => {
  try {
    store.setToken('')
    store.setWindowUserId('')
    store.setUserInfo({ userId: 0, account: '', avatar: '', nickname: '' })
  } catch (error) {
    console.error('Cleanup failed:', error)
  }
}

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  const userDataStr = urlParams.get('userData')
  
  if (userDataStr) {
    try {
      const parsedData = JSON.parse(decodeURIComponent(userDataStr)) as WindowUserData
      currentUser.value = parsedData
      
      if (currentUser.value) {
        store.setToken(currentUser.value.token)
        store.setWindowUserId(currentUser.value.userId)
        store.setUserInfo({
          userId: parseInt(currentUser.value.userId),
          account: currentUser.value.account,
          avatar: currentUser.value.avatar,
          nickname: currentUser.value.account
        })
      }
    } catch (e) {
      console.error('Failed to parse user data:', e)
    }
  }
})

onUnmounted(() => {
  cleanupOnClose()
})
</script>

<template>
  <div id="container">
    <div class="sidebar">
      <Sidebar />
    </div>

    <div class="friend-list">
      <FriendList />
    </div>

    <div class="chat-window">
      <ChatWindow />
    </div>
  </div>
</template>

<style scoped>
#container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 60px;
  height: 100%;
}

.friend-list {
  width: 240px;
  height: 100%;
  border-right: 1px solid #eee;
}

.chat-window {
  flex: 1;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(to right, #d7f1ff, #f3f0ff);
}
</style>