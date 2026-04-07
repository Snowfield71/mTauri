<template>
  <div class="container">
    <div class="sidebar">
      <img class="user-avatar" :src="userInfo?.avatar" @click="dialogFormVisible=true" />

      <el-dialog v-model="dialogFormVisible" label="编辑资料"  width="500">
        <div class="form-top">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="customUpload"
            accept="image/jpeg,image/png,image/gif"
          >
            <img class="form-avatar" :src="previewUrl" />
          </el-upload>
        </div>
        <el-form class="form" :model="form">
          <el-form-item>
            <el-input
              v-model="formData.nickname"
              placeholder="请输入昵称"
              autocomplete="off"
            >
              <template #prepend>昵称</template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-input
              v-model="formData.phoneNumber"
              placeholder="请输入手机号"
              autocomplete="off"
            >
              <template #prepend>手机号</template>
            </el-input>
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogFormVisible = false">关闭</el-button>
            <el-button type="primary" @click="handleUpdate">
              保存
            </el-button>
          </div>
        </template>
      </el-dialog>

      <el-popover
        ref="popoverRef"
        placement="right-end"
        :show-arrow="false"
        width="200px"
        trigger="click"
        :popper-style="{ padding: '6px', minWidth: '200px', margin: '14px 0 0 9px' }"
        :popper-options="popperOptions"
      >
        <div class="popover-content" @click="closeWindow">
          <div class="popover-btn">
            <el-icon><SwitchButton /></el-icon>
            <span>退出账户</span>
          </div>
        </div>
        
        <template #reference>
          <img class="menu" src="/menu.png" />
        </template>
      </el-popover>
    </div>
    
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
        <el-button class="add-btn" :icon="Plus" @click="createWindow" />
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
  </div>
</template>

<script setup lang="ts">
import { debounce } from '@/util'
import { delFriend } from '@/api/friend'
import { UpdateData } from '@/types/auth'
import { invoke } from '@tauri-apps/api/core'
import { listen } from "@tauri-apps/api/event"
import { ref, onMounted, computed } from 'vue'
import { uploadUserProfile } from '@/api/auth'
import { delConversation } from '@/api/conversation'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getConversationList } from '@/api/conversation'
import type { friendListItem } from '../../types/friend'
import { addConfig } from '@/views/Home/add/window.size'
import { FriendStore } from '@/store/friend/friend.store'
import { UserInfoStore } from '../../store/user/user.store'
import { loginConfig } from '@/views/Auth/Login/window.size'
import { Search, Plus, Close, SwitchButton } from '@element-plus/icons-vue'

const userStore = UserInfoStore()
const friendStore = FriendStore()

const userInfo = ref()
const keyword = ref('')
const isSearch = ref(false)

const friendList = computed(() => friendStore.friendList)

const searchResult = ref<friendListItem[]>([])

const dialogFormVisible = ref(false)

const previewUrl = ref('')

const form = ref({
  nickname: '',
  phoneNumber: ''
})

const formData = ref<UpdateData>({
  userId: 0,
  file: null,
  nickname: '',
  phoneNumber: ''
})

const popperOptions = {
  modifiers: [
    { name: 'flip', enabled: false },
    { name: 'preventOverflow', enabled: false },
    { name: 'computeStyles', options: { adaptive: false } },
  ],
}

const search = () => {
  const key = keyword.value.trim().toLowerCase()

  if (!key) {
    searchResult.value = []
    isSearch.value = false 
    return
  }

  isSearch.value = true
  searchResult.value = friendList.value.filter((item: friendListItem) => {
    const nickname = item.nickname?.toLowerCase() || ''
    const account = item.account?.toLowerCase() || ''
    const lastMessage = item.lastMessage?.toLocaleLowerCase() || ''
    return nickname.includes(key) || account.includes(key) || lastMessage.includes(key)
  })
}

const deleteFriend = (friendListItem: friendListItem, index: number) => {
  let uId = userStore.userInfo[0].userId || 0
  let fId = friendListItem.targetUserId
  let cId = friendListItem.conversationId
  
  delFriend(uId, fId).then((res: any) => {
    if (res.code == 200) {
      delConversation(uId, fId, cId).then((cRes: any) => {
        if (cRes.code == 200) {
          ElMessage.success('删除成功')
          friendStore.deleteFriendByIndex(index)
          getFriendList()
        }
      })
    }
  })
}

const beforeUpload = (file: File) => {
  const isImage = ['image/jpeg', 'image/png', 'image/gif'].includes(file.type)
  if (!isImage) {
    ElMessage.error('只能上传 JPG/PNG/GIF 格式的图片!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!')
    return false
  }
  return true
}

const customUpload = async (options: any) => {
  let { file, onError } = options

  previewUrl.value = URL.createObjectURL(file)

  formData.value.file = file
  
  try {
    ElMessage.success('头像添加成功')
  } catch (error) {
    ElMessage.error('头像添加失败')
    onError(error)
  }
}

const handleUpdate = async () => {
  dialogFormVisible.value = false

  if (!formData.value.file && userInfo.value.avatar) {
    const response = await fetch(userInfo.value.avatar)
    const blob = await response.blob()
    const fileName = userInfo.value.avatar.split('/').pop() || 'avatar.jpg'
    formData.value.file = new File([blob], fileName, { type: blob.type })
  }

  const res: any = await uploadUserProfile(formData.value)
  
  if (res.code === 200) {
    ElMessage.success('修改成功')

    userStore.setUserInfo(res.data)
    userInfo.value = userStore.getUserInfo()[0]
  } else {
    ElMessage.error(res.message || '修改失败')

    formData.value.userId = userInfo.value.userId
    formData.value.nickname = userInfo.value.nickname
    formData.value.phoneNumber = userInfo.value.phoneNumber
    previewUrl.value = userInfo.value.avatar
  }
}

const open = (item: friendListItem, index: number) => {
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

const handleItemClick = (item: friendListItem, id: number) => { 
  isSearch.value = false
  keyword.value = ''
  searchResult.value = []
  
  friendStore.setSelectId(id)
  friendStore.setFriendInfo(item)
}

const getFriendList = async () => {
  try {
    let uId = userInfo.value.userId || 0
    getConversationList(uId).then((res: any) => {
      if (res.code === 200) {
      res.data.forEach((item: friendListItem) => {

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

const createWindow = async() => {
  try {
    await invoke('create_window', { config: addConfig })
  } catch (err) {
    console.error('操作失败:', err)
  }
}

const closeWindow = async() => {
  try {
    await invoke('create_window', { config: loginConfig })
    await invoke('close_window')
  } catch (err) {
    console.error('操作失败:', err)
  }
}

onMounted(async () => {
  const userList = await userStore.getUserInfo()
  const user = userList?.[0]
  if (user) {
    userInfo.value = user
    formData.value.userId = userInfo.value.userId
    formData.value.nickname = userInfo.value.nickname
    formData.value.phoneNumber = userInfo.value.phoneNumber
    previewUrl.value = userInfo.value.avatar
    getFriendList()
  }

  listen('add-friend-success', () => {
    getFriendList()
  })
})
</script>

<style scoped>
.container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  width: 60px;
  height: 100%;
  background-color: #0099ff;
}

.form {
  margin-top: 20px;
}

.form-header {
  width: 100%;
  text-align: center;
}

.form-top {
  display: flex;
  justify-content: center;
  width: 100%;
}

.form-avatar {
  width: 128px;
  height: 128px;
  border-radius: 50%;
}

.user-avatar {
  width: 35px;
  height: 35px;
  border-radius: 50%;
  margin-top: 20px;
}

.menu {
  opacity: 0.7;
  width: 20px;
  height: 20px;
  margin-bottom: 20px;
  cursor: pointer;
}

.menu:hover {
  opacity: 1;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.logout-btn {
  width: 80px;
  border: none !important;
  background-color: white !important;
}

.el-button {
  border-color: transparent !important;
}

.el-button:hover {
  border-color: transparent !important;
}

.popover-btn {
  display: flex;
  align-items: center;
  width: 95%;
  padding: 3px;
  cursor: pointer;
}

.popover-btn span {
  margin-left: 5px;
}

.popover-btn:hover {
  color: #000000;
  background-color: #f5f5f5;
}

.list {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 0;
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
</style>