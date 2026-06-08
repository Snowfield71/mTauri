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
                <el-icon v-if="!expandedItems.has(index)" @click="toggle(index)">
                  <ArrowDown />
                </el-icon>
                <el-icon v-if="expandedItems.has(index)" @click="toggle(index)">
                  <ArrowUp />
                </el-icon>
                <div 
                  v-if="expandedItems.has(index)" 
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
import { ref, onMounted, computed } from 'vue'
import { PendingListItem } from '@/types/friend'
import { emit, listen } from "@tauri-apps/api/event"
import { ArrowDown, ArrowUp, Bell } from '@element-plus/icons-vue'
import { getPendingFriendList, agreeFriendRequest, rejectFriendRequest } from '@/api/friend'
import { UserInfoStore } from '@/store/user/user.store'
import { ElMessage } from 'element-plus'

interface WindowUserData {
  token: string
  userId: string
  account: string
  avatar: string
}

const userStore = UserInfoStore()
const userInfo = computed(() => userStore.getUserInfo()[0])

const pendingList = ref<PendingListItem[]>([])

const expandedItems = ref<Set<number>>(new Set())

const getPendingLists = () => {
  if (!userInfo.value) return
  
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

const toggle = (index: number) => {
  if (expandedItems.value.has(index)) {
    expandedItems.value.delete(index)
  } else {
    expandedItems.value.add(index)
  }
}

onMounted(() => {
  const hash = window.location.hash
  const queryIndex = hash.indexOf('?')
  const queryString = queryIndex !== -1 ? hash.substring(queryIndex + 1) : ''
  const urlParams = new URLSearchParams(queryString)
  
  const userDataStr = urlParams.get('userData')
  
  if (userDataStr) {
    try {
      const parsedData = JSON.parse(decodeURIComponent(userDataStr)) as WindowUserData
      
      if (parsedData) {
        userStore.setToken(parsedData.token)
        userStore.setWindowUserId(parsedData.userId)
        userStore.setUserInfo({
          userId: parseInt(parsedData.userId),
          account: parsedData.account,
          avatar: parsedData.avatar,
          nickname: parsedData.account
        })
        
        getPendingLists()
      }
    } catch (e) {
      console.error('Failed to parse user data:', e)
    }
  }
  
  listen('refresh-pending-list', () => {
    getPendingLists()
  })
  
  listen('friendAgreed', () => {
    getPendingLists()
  })
  
  listen('pendingApplyUpdate', () => {
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
  right: -35px;
  bottom: -35px;
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
