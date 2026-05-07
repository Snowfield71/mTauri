<template> 
    <div class="container">
        <div class="avatar-wrapper">
            <img 
                class="avatar-image" 
                :src="userInfo.avatar || defaultAvatarSrc" 
            />
            <el-icon 
                class="remove-icon"
                v-if="isInRemoveMode" 
                size="20" 
                color="#72787f" 
                @click="isDeleteClicked = toggleState(isDeleteClicked)"
            >
                <CircleCloseFilled />
            </el-icon>
            <el-icon 
                class="remove-icon"
                v-if="isInRemoveMode && isDeleteClicked"
                size="20" 
                color="#90EE90" 
                @click="isDeleteClicked = toggleState(isDeleteClicked)"
            >
                <CircleCloseFilled />
            </el-icon>
        </div>
        <p class="nickname">{{ userInfo.nickname }}</p>
        <el-button
            class="login-button"
            v-if="!isInRemoveMode" 
            type="primary"
            @click="submit"
        >
            登录
        </el-button>
        <div class="action-buttons">
            <template v-if="!isInRemoveMode">
                <el-link 
                    underline="never"
                    type="primary" 
                    @click="navTo(router, { name: 'Login' })"
                >
                    添加账户
                </el-link>
                <span class="divider"></span>
                <el-link
                    underline="never" 
                    type="primary" 
                    @click="isInRemoveMode = toggleState(isInRemoveMode)"
                >
                    移除账户
                </el-link>
            </template>
            <el-link 
                v-else 
                underline="never" 
                type="primary" 
                @click="removeAccount()"
            >
                完成
            </el-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue"
import { useRouter } from 'vue-router'
import { tokenLogin } from '@/api/auth.ts'
import { invoke } from '@tauri-apps/api/core'
import { navTo } from '../../../util/index.ts'
import { defaultConfig } from './window.size.ts'
import { toggleState } from '../../../util/index.ts'
import { UserInfoData } from '../../../types/auth.ts'
import { initWindowConfig } from '@/util/windowConfig.ts'
import { UserInfoStore } from '@/store/user/user.store.ts'
import { CircleCloseFilled } from '@element-plus/icons-vue'
import { baseURL } from "@/util/request.ts"
import { homeConfig } from '../../Home/Home/window.size.ts'

const store = UserInfoStore()
const router = useRouter()

// 默认头像地址
const defaultAvatarSrc = ref<string>(baseURL + '/uploads/avatars/DefaultAvatar.png')

// 控制是否处于删除状态
const isInRemoveMode = ref<boolean>(false)

// 是否点击删除
const isDeleteClicked = ref<boolean>(false)

// 默认用户信息
const userInfo = ref<UserInfoData>({
    userId: 0,
    nickname: '',
    account: '',
    token: '',
    avatar: ''
})

const token = ref('')

const loadUserData = () => {
    const user = store.getUserInfo()[0]
    if(user) {
        const { phoneNumber, ...loadUserData } = user
        userInfo.value = loadUserData
        token.value = store.token
    }
} 

onMounted(() => {
    // 设置窗口禁止最大化
    initWindowConfig(defaultConfig)

    loadUserData()
})

// 移除账户
const removeAccount = async() => {
    if (!isDeleteClicked.value) {
        isInRemoveMode.value = false
        return
    }

    store.deleteUserInfo(0)
    navTo(router, {'name': 'Login'})
}

const submit = async () => {
  const { account, userId } = userInfo.value

  const params = {
    account: account,
    userId: userId || 0,
    token: token.value
  }

  tokenLogin(params).then((res: any) => {
    if (res.code == 200) {
      ElMessage({
        message: '登录成功',
        type: 'success'
      })

      const { token, user} = res

      store.setUserInfo(user)
      store.setToken(token)
       
      router.push({
        name: 'Home'
      })
      
      invoke('create_window', { config: homeConfig})

      setTimeout(() => {
        invoke('close_window').catch(err => {
          console.error('关闭窗口失败:', err)
        })
      }, 100)
    }
  }).catch((err: any) => {
    if (err) {
      ElMessage({
        message: '登录过期, 请重新登录',
        type: 'warning'
      })
      
      router.push({
        name: 'Login'
      })
    }
  })
}
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.avatar-wrapper {
  position: relative;
  width: fit-content;
  margin-bottom: 20px;
}

.avatar-image {
  width: 100px;
  height: 100px;
  border: 3px solid #ffffff;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.avatar-image:hover {
  transform: scale(1.05);
}

.remove-icon {
  position: absolute;
  right: -5px;
  top: -5px;
  cursor: pointer;
  background: white;
  border-radius: 50%;
  padding: 3px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.remove-icon:hover {
  transform: scale(1.1);
  color: #f56c6c !important;
}

.nickname {
  margin: 15px 0;
  font-size: 18px;
  font-weight: 500;
  color: #333;
}

.login-button {
  width: 200px;
  margin: 15px 0;
  transition: all 0.3s ease;
}

.action-buttons {
  position: absolute;
  bottom: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.divider {
  width: 1px;
  height: 12px;
  background-color: #cdddeb;
  margin: 0 5px;
}

.el-link {
  transition: color 0.2s ease;
}

.el-link:hover {
  color: #409eff !important;
}
</style>