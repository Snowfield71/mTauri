<template>
  <div class="sidebar">
    <img class="user-avatar" :src="userInfo?.avatar" @click="dialogFormVisible = true" />

    <el-dialog v-model="dialogFormVisible" label="编辑资料" width="500">
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
        <el-icon 
          class="menu" 
          size="32"
          color="white">
          <Menu />
        </el-icon>
      </template>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { invoke } from '@tauri-apps/api/core'
import { ElMessage } from 'element-plus'
import { uploadUserProfile } from '@/api/auth'
import { UpdateData } from '@/types/auth'
import { UserInfoStore } from '../../store/user/user.store'
import { loginConfig } from '@/views/Auth/Login/window.size'
import { SwitchButton, Menu } from '@element-plus/icons-vue'

const emit = defineEmits(['user-update'])

const userStore = UserInfoStore()

const userInfo = computed(() => userStore.getUserInfo()[0])
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

// 监听 userInfo 变化，更新表单数据
watch(userInfo, (newUser) => {
  if (newUser) {
    formData.value.userId = newUser.userId || 0
    formData.value.nickname = newUser.nickname || ''
    formData.value.phoneNumber = newUser.phoneNumber || ''
    previewUrl.value = newUser.avatar || ''
  }
}, { immediate: true })

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

  if (!formData.value.file && userInfo.value?.avatar) {
    const response = await fetch(userInfo.value.avatar)
    const blob = await response.blob()
    const fileName = userInfo.value.avatar.split('/').pop() || 'avatar.jpg'
    formData.value.file = new File([blob], fileName, { type: blob.type })
  }

  const res: any = await uploadUserProfile(formData.value)
  
  if (res.code === 200) {
    ElMessage.success('修改成功')

    userStore.setUserInfo(res.data)
    emit('user-update', userStore.getUserInfo()[0])
  } else {
    ElMessage.error(res.message || '修改失败')
    if (userInfo.value) {
      formData.value.userId = userInfo.value.userId || 0
      formData.value.nickname = userInfo.value.nickname || ''
      formData.value.phoneNumber = userInfo.value.phoneNumber!
      previewUrl.value = userInfo.value.avatar || ''
    }
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
</script>

<style scoped>
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
  cursor: pointer;
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
</style>