<script setup lang="ts">
import FridendList from '@/components/Home/FriendList.vue'
import ChatWindow from '@/components/Home/ChatWindow.vue'
</script>

<template>
  <div id="container">
    <div class="sidebar">
      <FridendList />
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
  width: 300px;
  height: 100%;
  border-right: 1px solid #eee;
  background: #fff;
}

.chat-window {
  flex: 1;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(to right, #d7f1ff, #f3f0ff);
}
</style>