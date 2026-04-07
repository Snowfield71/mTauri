<template>
  <el-card v-loading="loading" id="container">
    <template #header>
      <span id="title">找回密码</span>
    </template>
    
    <template #default>
      <div id="phoneMethod-content">
        <p>手机号码验证</p>
        <p>请填写完整的手机号
          <span id="content-phone">{{ phoneNumber }}</span>
          以验证身份
        </p>
        <PhoneVerification 
          codeInputWidth="250px"
          :isPhoneInputFocused="true"
          v-model:phoneNumber="phoneVerificationData.phoneNumber"
          v-model:code="phoneVerificationData.code"
        />
        <el-button type="primary" :disabled="!(phoneVerificationData.phoneNumber && phoneVerificationData.code)" id="next-step" @click="nextStep()">下一步</el-button>
    </div>
    </template>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { verifyPhone } from '@/api/auth.ts' 
import { invoke } from '@tauri-apps/api/core'
import { useRoute, useRouter } from 'vue-router'
import { debounce } from '../../../util/index.ts'
import { phoneMethodConfig } from './window.size'
import { PhoneNumberAndCode } from '../../../types/auth'
import PhoneVerification from '../../../components/Auth/PhoneVerificationForm.vue'

const loading = ref(false)

const route = useRoute()
const router = useRouter()
const phoneNumber = route.query.phoneNumber

const { width, height } = phoneMethodConfig

onMounted(() => {
  invoke('set_window_size', { width: width, height: height }).catch(err => {
    console.error('设置窗口大小失败:', err)
  })
})

const phoneVerificationData = ref<PhoneNumberAndCode>({
  phoneNumber: '',
  code: ''
})

const nextStep = () => {
  loading.value = true

  debounce(async () => {
    try {
      if (!phoneVerificationData.value.phoneNumber) {
        ElMessage.warning('请输入手机号')
        return
      }

      verifyPhone({
        type: 'phone',
        value: phoneVerificationData.value.phoneNumber,
        name: '手机号',
      }).then((res: any) => {
        if (res.code === 200) {
        ElMessage.warning('验证失败')
      } else {
        ElMessage.success('验证成功')
        router.push(
          { 
            name: 'ResetPwd',
            query: {
              phoneNumber: phoneVerificationData.value.phoneNumber
            }
          },
        )
      }})      
    } finally {
      loading.value = false
    }
  }, 500)()
}

</script>

<style scoped>
#container {
  height: calc(100% - 2px);
}

#phoneMethod-content {
  font-size: 13px;
}

#content-phone {
  color: #fdad3e;
}

#next-step {
  width: 100%;
}
</style>