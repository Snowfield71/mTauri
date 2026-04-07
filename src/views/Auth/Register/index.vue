<template>
  <div id="container">
    <h1 id="title">欢迎注册</h1>
    <el-form id="register-form" 
      :model="registerForm" 
      :inline="true"
      :rules="validationRules" 
      ref="registerFormRef" 
      label-width="100px"
      @submit.prevent="submit"
    >
        <el-form-item>
          <el-input
            prop="nickname" 
            v-model="registerForm.nickname" 
            placeholder="请输入昵称" 
            label-width="0" 
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            prop="password" 
            v-model="registerForm.password" 
            type="password" 
            placeholder="请输入密码" 
            label-width="0" 
            autocomplete="off" 
            show-password
          />
        </el-form-item>
        <PhoneVerificationForm
          v-model:phoneNumber="registerForm.phoneNumber"
          v-model:code="registerForm.code"
          containerWidth="300px"
          codeInputWidth="190px"
        />
        <UserAgreement 
          :agreementAccepted="agreementAccepted" 
          @click="agreementAccepted = toggleState(agreementAccepted)"
        />
        <el-button 
          class='register-button' 
          type="primary" 
          @click="() => debounce(submit, 2000)()"
        >
          立即注册
        </el-button>
      </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { emit } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/core'
import { register } from '../../../api/auth.ts'
import { registerConfig } from './window.size.ts'
import { ElForm, ElMessage } from 'element-plus'
import { RegisterFormData } from '../../../types/auth.d'
import { initWindowConfig } from '@/util/windowConfig.ts'
import { UserInfoStore } from '@/store/user/user.store.ts'
import { toggleState, debounce } from '../../../util/index.ts'
import type { UserInfoData } from '@/store/user/user.type.ts'
import UserAgreement from '../../../components/Auth/UserAgreement.vue'
import PhoneVerificationForm from '../../../components/Auth/PhoneVerificationForm.vue'

onMounted(() => {
  initWindowConfig(registerConfig)
})

const store = UserInfoStore()

let agreementAccepted = ref<boolean>(false)

const registerForm = ref<RegisterFormData>({
  nickname: '',
  password: '',
  phoneNumber: '',
  code: '',
  userId: 0,
  avatarUrl: '/UserAvatar.jpg'
})

const validationRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 16, message: '密码长度不能小于6位', trigger: 'change' }
  ],
  phoneNumber: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { min: 6, max: 6, message: '验证码长度为6位', trigger: 'change' }
  ]
}

const registerFormRef = ref<InstanceType<typeof ElForm> | null>(null)

const submit = async () => {
  for (const key in registerForm.value) {
    if (
      (registerForm.value as Record<string, any>)[key] === ''
    ) {
      ElMessage({
        message: '请填写完整的注册信息',
        type: 'warning'
      })
      return
    }
  }

  await registerFormRef.value?.validate((valid: boolean) => {
    if (!valid) {
      ElMessage({
        message: '请填写完整的注册信息',
        type: 'warning'
      })
      return
    }

    if (!agreementAccepted.value) {
      ElMessage({
        message: '请阅读并同意用户协议',
        type: 'warning'
      })
      return
    }
    register(registerForm.value).then((res: any) => {
      const result = res
      if (result.code == 409) {
        ElMessage.warning(result.message)
        return
      }
      
      const user = result.user

      if (result.code == 201) {
          const userInfo: UserInfoData = {
          userId: user.userId,
          account: user.account,
          nickname: user.nickname,
          phoneNumber: user.phoneNumber,
          avatar: user.avatar
        }

        store.setUserInfo(userInfo)
        store.setIsRegister(true)

        emit('registration-completed', { userInfo })

        ElMessage.success('注册成功')

        setTimeout(() => {
          invoke('close_window').catch(err => {
            console.error('关闭窗口失败:', err)
          })
        }, 2000)
      }
    })
  })
}
</script>

<style scoped>
  a {
    text-decoration: none;
    color: #57a7f3 !important;
  }

  :deep(.el-radio.is-checked) p {
    color: inherit !important;
  }

  :deep(.el-radio.is-checked) a {
    color: #57a7f3 !important;
  }

  :deep(.el-input) {
    width: 300px;
  }

  :deep(.el-select .el-input__wrapper) {
    padding-left: 8px;
  }

  :deep(.el-select .el-input__prefix) {
    left: 8px;
    color: #606266;
  }

  :deep(.el-select-dropdown__item) {
    padding: 0 12px;
  }

  :deep(.el-select .el-input__inner) {
    padding-left: 20px;
  }

  :deep(.el-popper) {
    top: 35px !important;
    left: 0px !important;
  }
  
  :deep(.el-popper) {
    overflow: auto; 
  }

  #container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  #title {
    font-size: 24px;
    font-weight: 400;
    color: #333;
  }

  .form-item {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
  }

  #register-form {
    width: 300px;
  }

  .phone-wrapper {
    display: flex;
    align-items: center;
    width: 300px;
    gap: 8px; 
  }

  .area-select {
    flex: 0 0 auto;
    width: 120px; 
  }

  .phone-input,
  .code-time  {
    flex: 1;
  }

  .code-input {
    width: 190px;
  }

  .code-wrapper {
    display: flex;
    width: 300px;
    gap: 8px;
  }

  .send-code,
  .code-time {
    color: #57a7f3;
  }

  .register-button {
    width: 100%;
  }
</style>