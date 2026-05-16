<template>
  <div id="container">
    <div id="login-avatar">
      <img :src="savedAccounts[selectedAvatarIndex]?.avatar || defaultAvatarSrc" />
    </div>
    <el-form
      class="form"
      ref="loginFormRef"
      :model="form"
      :rules="loginValidationRules"
      id="login-form"
      @submit.prevent="submit"
    >
      <el-input
          id="login-form-account"
          prop="account"
          v-model="form.account"
          placeholder="请输入账号"
          class="form-input"
          @clear="clearInputField('account')"
      >
      <template #prefix>
        <div class="div-placeholder"></div>
      </template>
          <template #suffix>
            <el-icon id="account-icon" tabindex="-1">
              <Close v-show="form.account && savedAccounts.length" @click="clearInputField('account')" tabindex="-1" />
            </el-icon>
            <el-dropdown
              tabindex="-1"
              ref="accountDropdownRef"
              trigger="click"
              :popper-options="accountDropdownOptions"
            >
              <el-icon tabindex="-1">
                <arrow-down v-show="accountDropdownVisible && savedAccounts.length" @click="accountDropdownVisible = toggleState(accountDropdownVisible)" tabindex="-1" />
                <arrow-up v-show="!accountDropdownVisible && savedAccounts.length" @click="accountDropdownVisible = toggleState(accountDropdownVisible)" tabindex="-1" />
                <Close v-show="form.account && !savedAccounts.length" @click="clearInputField('account')" tabindex="-1" />
              </el-icon>
              <template #dropdown>
                <div class="custom-dropdown-menu">
                  <div
                    v-for="(item, index) in savedAccounts"
                    :key="item.account"
                    class="dropdown-item"
                  >
                    <img :src="item.avatar" class="dropdown-avatar" />
                    <span class="dropdown-account" @click.stop="selectSavedAccount(item, index)">{{ item.account }}</span>
                    <el-icon
                      @click.stop="removeAccount(index)"
                      class="dropdown-remove-icon"
                      tabindex="-1"
                    >
                      <Close tabindex="-1" />
                    </el-icon>
                  </div>
                </div>
              </template>
            </el-dropdown>
          </template>
        </el-input>
      <el-input
          prop="password"
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          class="form-input"
          @clear="clearInputField('password')"
        >
          <template #prefix>
            <div class="div-placeholder"></div>
          </template>
          <template #suffix>
            <div class="input-slot pwd-slot">
              <el-icon class="slot-icon" tabindex="-1">
               <Close v-show="form.password" @click="clearInputField('password')" tabindex="-1" />
              </el-icon>
            </div>
          </template>
        </el-input>
      <UserAgreement
          :agreementAccepted="agreementAccepted"
          @click="agreementAccepted = toggleState(agreementAccepted)"
      />
    </el-form>
    <el-button id="login-submit-button" type="primary" :disabled="!(agreementAccepted && form.account && form.password)" @click="submit">登录</el-button>
    <div id="login-popover-container">
      <el-popover
        ref="moreOptionsPopover"
        :popper-style="{ minWidth: '80px' }"
        width="80"
        trigger="click"
      >
        <div id="login-popover-buttons">
          <el-button id="login-register-button" type="primary" size="small" @click="openAuthWindow('Register')">注册账号</el-button>
          <el-button id="login-forget-button" type="danger" size="small" @click="openAuthWindow('ForgetPwd')">忘记密码</el-button>
        </div>
        <template #reference>
          <el-button id="login-more-options">更多选项</el-button>
        </template>
      </el-popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { login } from '../../../api/auth'
import { loginConfig } from './window.size'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { toggleState } from '../../../util/index'
import { baseURL } from '../../../util/request'
import { FriendStore } from '@/store/friend/friend.store'
import type { SaveAccountData } from '../../../types/auth'
import { initWindowConfig } from '@/util/windowConfig'
import type { UnlistenFn } from '@tauri-apps/api/event'
import { UserInfoStore } from '@/store/user/user.store'
import { registerConfig } from '../Register/window.size'
import { forgetPwdConfig } from '../ForgetPwd/window.size'
import type { UserInfoData } from '@/store/user/user.type'
import { createHomeConfig } from '@/views/Home/Home/window.size'
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { ArrowUp, ArrowDown, Close } from '@element-plus/icons-vue'
import UserAgreement from '../../../components/Auth/UserAgreement.vue'
import { ElForm, ElPopover, ElMessage, ElDropdown, ElButton } from 'element-plus'

const userStore = UserInfoStore()
const friendStore = FriendStore()
const isRegister = computed(() => userStore.isRegister)

watch(isRegister, (newValue, oldValue) => {
  if (newValue != oldValue) {
    userStore.setIsRegister(false)
  }
})

const unlisten = ref<UnlistenFn | null>(null)

const savedAccounts = ref<SaveAccountData[]>([])

const defaultAvatarSrc = ref<string>(baseURL + '/uploads/avatars/DefaultAvatar.png')

const form = ref({
  account: '',
  password: ''
})

watch(savedAccounts, (newVal) => {
  form.value.account = newVal[0]?.account ?? ''
}, { immediate: true })

const accountDropdownOptions = {
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [-105, 20],
      },
    },
  ],
}

let agreementAccepted = ref<boolean>(false)

let accountDropdownVisible = ref<boolean>(true)

let selectedAvatarIndex = ref<number>(0)

const loginFormRef = ref<InstanceType<typeof ElForm> | null>(null)
const moreOptionsPopover = ref<InstanceType<typeof ElPopover> | null>(null)
const accountDropdownRef = ref<InstanceType<typeof ElDropdown> | null>(null)

const loginValidationRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'change' },
    { min: 6, message: '密码长度不能小于6位', trigger: 'change' }
  ]
}

const clearInputField = (type: 'account' | 'password') => {
  if (type === 'account') {
    form.value.account = ''
  } else {
    form.value.password = ''
  }
}

const submit = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate()

  if (!agreementAccepted.value) {
    ElMessage({
      message: '请阅读并同意服务协议',
      type: 'warning'
    })
    return
  }
  
  login(form.value).then((res: any) => {
    if (res.code == 200) {
      ElMessage({
        message: '登录成功',
        type: 'success'
      })

      const { code, ...userInfoData} = res.user
      const token = res.token
      
      friendStore.clearFriendInfo()

      userStore.setUserInfo(userInfoData)
      userStore.setToken(token)

      const homeWindowConfig = createHomeConfig({
        token: token,
        userId: res.user.userId.toString(),
        account: res.user.account,
        avatar: res.user.avatar
      })

      invoke('create_window', { config: homeWindowConfig}).then(() => {
        setTimeout(() => {
          invoke('close_window').catch(err => console.error('Failed to close window:', err))
        }, 300)
      }).catch((error: any) => {
        ElMessage({
          message: error || '该账号已登录',
          type: 'warning'
        })
      })

      form.value.password = ''
    } else {
      ElMessage({
        message: res.message || '账号或密码错误',
        type: 'warning'
      })
    }
  }).catch((error: any) => {
    ElMessage({
      message: error?.message || '登录失败',
      type: 'warning'
    })
  })
}

const openAuthWindow = async (type: 'Register' | 'ForgetPwd') => {
    try {
      if (type === 'Register') {
        await invoke('create_window', { config: registerConfig })
      }
      if (type === 'ForgetPwd') {
        await invoke('create_window', { config: forgetPwdConfig })
      }

     moreOptionsPopover.value?.hide()
    } catch (error) {
      console.error('Window creation failed:', error)
    }
  }

const selectSavedAccount = (item: SaveAccountData, index: number) => {
  form.value.account = item.account
  accountDropdownVisible.value = false

  selectedAvatarIndex.value = index

  accountDropdownRef.value?.handleClose()
}

const removeAccount = (index: number) => {
  userStore.deleteUserInfo(index)
  savedAccounts.value.splice(index, 1)
  form.value.account = ''
}

onMounted(async () => {
  initWindowConfig(loginConfig)
  let info = userStore.getUserInfo()

  if (info && info.length > 0) {
    savedAccounts.value = info.map(item => ({
      account: item.account || '',
      avatar: item.avatar || '',
    }))
  }

  unlisten.value = await listen<{ userInfo: UserInfoData }>('registration-completed', (event) => {
    userStore.setUserInfo(event.payload.userInfo)
    userStore.setIsRegister(false)

    form.value.account = event.payload.userInfo.account
    savedAccounts.value[selectedAvatarIndex.value].avatar = event.payload.userInfo.avatar
  })
})

onUnmounted(async () => {
  if (unlisten.value) {
    await unlisten.value()
  }
})
</script>

<style scoped>
a {
  text-decoration: none;
  color: #57a7f3 !important;
}

:deep(.el-input__inner) {
  text-align: center;
}

:deep(.circle-checkbox .el-checkbox__input) {
  border-radius: 50%;
  margin-right: 5px;
}

:deep(.el-input__inner:focus + .el-input__suffix .el-input__clear,
.el-input__inner:not(:placeholder-shown) + .el-input__suffix .el-input__clear) {
  opacity: 1;
}

:deep(.el-input__wrapper) {
  box-shadow: none;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
}

:deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 1px #409eff;
}

:deep(.el-form-item__error) {
  padding-left: 4px;
}

:global(.el-dropdown__popper .el-popper__arrow),
:global(.el-dropdown__popper .el-popper__arrow:before) {
  display: none !important;
}

.form-input {
  margin-bottom: 20px;
  width: 250px;
}

#account-icon {
  margin-right: 8px;
}

.custom-dropdown-menu {
  width: 250px;
}

.dropdown-item {
  position: relative;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f5f7fa;
}

.dropdown-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}

.dropdown-account {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  margin-left: -10px;
}

.dropdown-remove-icon {
  color: #c0c4cc;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s, color 0.2s;
}

.dropdown-item:hover .dropdown-remove-icon {
  opacity: 1;
}

.dropdown-remove-icon:hover {
  color: #f56c6c;
}

#container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: fit-content;
}

#login-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid #FFF;
  margin: 30px 0 20px 0;
}

#login-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

#login-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 280px;
}

#login-submit-button {
  width: 80%;
}

#login-form-account {
  display: flex;
}

.input-slot {
  width: 10px;
}

.pwd-slot {
  width: 31px;
}

.slot-icon {
  float: right;
}

#login-popover-container {
  position: absolute;
  bottom: 20px;
}

#login-popover-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: #FFFFFF;
}

#login-more-options {
  background-color: transparent;
  border: none;
  color: #268ef6;
  font-weight: 400;
}

.div-placeholder {
  width: 36px;
}


#login-register-button,
#login-forget-button {
  background-color: transparent;
  border: none;
  color: #000;
  width: 100%;
  font-weight: 400;
}

#login-register-button:hover,
#login-forget-button:hover {
  background-color: #f5f5f5;
}

#login-forget-button {
  margin-left: -1px;
}
</style>
