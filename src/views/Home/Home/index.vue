<script setup lang="ts">
import Sidebar from '@/components/Home/Sidebar.vue'
import FriendList from '@/components/Home/FriendList.vue'
import ChatWindow from '@/components/Home/ChatWindow.vue'
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