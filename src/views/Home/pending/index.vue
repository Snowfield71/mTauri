<template>
  <div class="container">
    <div class="title">好友通知</div>
    <div v-if="pendingList.length > 0" class="content-wrapper">
      <el-scrollbar class="scrollbar">
        <div 
          class="list-item"
          v-for="(item, index) in pendingList"
          :key="index">
          <img :src="item.avatar" />
          <div class="info">
            <span>( {{ item.account }} )</span>
            <span> 请求加为好友</span>
            <p class="nickname">{{ item.nickname }}</p>
          </div>
          <el-button class="custom-button">
            <template #default>
              <div class="default">
                <span @click="agree(item.id, index)">同意</span>
                <el-icon v-if="!isSelect" @click="toggle">
                  <ArrowDown />
                </el-icon>
                <el-icon v-if="isSelect" @click="toggle">
                  <ArrowUp />
                </el-icon>
                <div 
                  v-if="isSelect" 
                  class="reject" 
                  @click="reject(item.id, index)">
                  <span>拒绝</span>
                </div>
              </div>
            </template>
          </el-button>
        </div>
      </el-scrollbar>
    </div>
    <div v-else class="null">
      <el-icon class="bell" size="32">
        <Bell />
      </el-icon>
      <p>暂无通知</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PendingListItem } from '@/types/friend'
import { emit, listen } from "@tauri-apps/api/event"
import { ArrowDown, ArrowUp, Bell } from '@element-plus/icons-vue'
import { getPendingFriendList, agreeFriendRequest, rejectFriendRequest } from '@/api/friend'

const pendingList = ref<PendingListItem[]>([])
const isSelect = ref(false)

const getPendingLists = () => {
  getPendingFriendList().then((res: any) => {
    if (res.code == 200) {
      pendingList.value = res.data
    }
  })
}

const agree = (friendId: number, index: number) => {
  agreeFriendRequest(friendId).then((res: any) => {
    if (res.code == 200) {
      ElMessage.success(res.message)
      pendingList.value.splice(index, 1)
      
      emit('refresh-friend-list', {
        friendId: friendId
      });
    }
  })
}

const reject = (friendId: number, index: number) => {
  rejectFriendRequest(friendId).then((res: any) => {
    if (res.code == 200) {
      ElMessage.success(res.message)
      pendingList.value.splice(index, 1)

      emit('refresh-pending-list')
    }
  })
}

const toggle = () => {
  isSelect.value = !isSelect.value
}

onMounted(() => {
  getPendingLists()
  
  listen('refresh-pending-list', () => {
    getPendingLists()
  })
})
</script>

<style scoped>
:deep(.custom-button:hover) {
  font-weight: normal !important;
  color: black !important;
  background: none !important;
  border-color: #dcdfe6;
}

.container {
  width: 100vw;
  height: 100vh;
  background-color: #f2f2f2;
  display: flex;
  flex-direction: column;
}

.title {
  padding: 20px;
  font-size: 17px;
  font-weight: 500;
}

.content-wrapper {
  flex: 1;
  overflow: hidden;
  padding: 0 20px;
}

.scrollbar {
  display: flex;
  justify-content: center;
  height: 100%;
}

.list-item {
  display: flex;
  align-items: center;
  width: 600px;
  padding: 20px;
  margin: 10px 0;
  border-radius: 10px;
  background-color: white;
}

.list-item img {
  width: 42px;
  height: 42px;
  border-radius: 50%;
}

.info {
  flex: 1;
  margin-left: 20px;
}

.info p {
  margin: 0;
  padding: 0;
}

.nickname {
  color: #409eff;
}

.default {
  position: relative;
  display: flex;
  align-items: center;
}

.reject {
  position: absolute;
  right: -40px;
  bottom: -40px;
  padding: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: white;
}

.null {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}
.null p {
  margin-top: 40px;
  font-weight: 400;
}
.bell {
  position: relative;
  width: 64px;
  height: 64px;
}
.bell::after {
  content: '';
  position: absolute;
  width: 64px;
  height: 64px;
  padding: 20px;
  border: 1px solid black;
  border-radius: 50%;
}
</style>
