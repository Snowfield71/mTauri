<template>
  <div class="container">
    <div class="search">
      <el-input
        class="search-input"
        v-model="keyword"
        placeholder="输入搜索关键词"
        :prefix-icon="Search"
        @keydown.enter="handleSearch"
      >
        <template #suffix>
          <el-icon v-if="keyword" @click="clearKeyword">
            <Close />
          </el-icon>
        </template>
      </el-input>
      <el-button 
        class="search-btn" 
        type="primary"
        @click="handleSearch">搜索</el-button>
    </div>
    <div class="content">
      <div v-if="!searchList.length" class="null">
        <el-icon class="message-box" size="32">
          <MessageBox />
        </el-icon>
        <p>输入关键词搜索</p>
      </div>
      <div v-else class="search-list">
        <el-scrollbar>
          <div
            class="search-list-item"
            v-for="(item, index) in searchList"
            :key="index"
          >
            <el-popover
              trigger="click"
              width="200px"
              :show-arrow="false"
              popper-class="custom-popover"
            >
              <div class="popover">
                <img class="popover-avatar" :src="item.avatar" />
                <div class="popover-info">
                  <span>( {{ item.account }} )</span>
                  <span>{{ item.nickname }}</span>
                </div>
              </div>
              <el-button class="popover-btn" type="primary">添加</el-button>
              <template #reference>
                <div class="flex-center">
                  <img class="avatar" :src="item.avatar" />
                  <span>{{ item.nickname }}</span>
                </div>
              </template>
            </el-popover>
            <el-button 
              plain
              v-if="!item.isAdded"
              style="margin-left: auto" 
              @click="open(item, index)">添加</el-button>
            <el-button v-else style="margin-left: auto" @click="sendMsg(item.id)">发消息</el-button>
          </div>
        </el-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref} from 'vue'
import { emit } from "@tauri-apps/api/event"
import type { SearchListItem } from '@/types/friend'
import { ElMessage, ElMessageBox } from 'element-plus'
import { applyFriend, searchFriend } from '@/api/friend'
import { UserInfoStore } from '@/store/user/user.store'
import { createConversation } from '@/api/conversation'
import { FriendStore } from '@/store/friend/friend.store'
import { Search, Close, MessageBox } from '@element-plus/icons-vue'

const keyword = ref('')
const userStore = UserInfoStore()
const friendStore = FriendStore()
const userId = ref<number>(
  userStore.userInfo?.[0]?.userId || 0
)
const searchList = ref<SearchListItem[]>([])

const clearKeyword = () => {
  keyword.value = ''
}

const handleSearch = () => {
  if (!keyword.value) return
  searchFriend(keyword.value).then((res: any) => {
    if (res.code === 200) {
      let currentUserId = userStore.userInfo[0].userId
      let friendList = friendStore.friendList
      
      const friendIds = friendList.map((friend: any) => friend.targetUserId)
      
      const searchResults = res.data
        .filter((item: SearchListItem) => item.id !== currentUserId)
        .map((item: SearchListItem) => {
          const isFriend = friendIds.includes(item.id)
          return {
            ...item,
            isAdded: isFriend
          }
        })
        
      searchList.value = searchResults
    }
  })
}

const open = (item: SearchListItem, index: number) => {
  let nickname = item.nickname
  ElMessageBox.confirm(
    `是否添加${nickname}`,
    '添加好友',
    {
      confirmButtonText: '添加',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      if (item) {
        handleAdd(item, index)
      }
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消添加',
      })
    })
}

const handleAdd = (item: SearchListItem, index: number) => {
  let friendId = item.id
  applyFriend(userId.value, item.id).then((res: any) => {
    if (res.code == 200) {
      if (res.message == '添加成功') {
        ElMessage.success(res.message)
        searchList.value[index].isAdded = true
        handleCreatConversation(friendId)
      } else {
        ElMessage.info(res.message)
      }
    }
  })
}

const handleCreatConversation = (friendId: number) => {
  createConversation(friendId)
}

const sendMsg = (id: number) => {
  friendStore.setSelectedId(id)
  let info = friendStore.getFriendInfo(id)
  if (info) {
    friendStore.setFriendInfo(info)
  }
  emit("friend-info-update", {
    selectedId: id,
    friendInfo: info
  })
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}
.search {
  display: flex;
  gap: 5px;
  padding: 20px;
  border-bottom: 1px solid #cccccc;
}
.search-btn {
  width: 80px;
}
.content {
  flex: 1;
  width: 100%;
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
.message-box {
  position: relative;
  width: 64px;
  height: 64px;
}
.message-box::after {
  content: '';
  position: absolute;
  width: 64px;
  height: 64px;
  padding: 20px;
  border: 1px solid black;
  border-radius: 50%;
}
.search-list {
  width: 100%;
}
.search-list-item {
  display: flex;
  align-items: center;
  height: 70px;
  padding: 0 20px;
}
.search-list-item:hover {
  background-color: #f5f5f5;
}
.flex-center {
  display: flex;
  align-items: center;
  gap: 15px;
}
.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
}
.popover {
  display: flex;
}
.popover-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
}
.popover-info {
  margin-left: 20px;
  display: flex;
  text-align: center;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  height: 64px;
}
.popover-btn {
  width: 100%;
  margin-top: 5px;
}
</style>

<style>
.el-popover.custom-popover {
  margin: -10px 0 0 10px;
  background: linear-gradient(
    to bottom,
    #d7f1ff 0%,
    white 100%
  );
}
</style>