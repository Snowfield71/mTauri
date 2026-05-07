<template>
  <el-card v-loading="loading" id="container">
    <template #header>
      <span id="title">找回密码</span>
    </template>
    
    <template #default>
      <el-form
        ref="phoneMethodFormRef"
        :model="phoneVerificationData"
        :rules="phoneMethodValidationRules"
        id="phoneMethod-form"
        @submit.prevent="nextStep"
      >
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
          <el-button
            type="primary"
            :disabled="!(phoneVerificationData.phoneNumber && phoneVerificationData.code)"
            id="next-step"
            @click="nextStep"
          >
            下一步
          </el-button>
        </div>
      </el-form>
    </template>
  </el-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElForm, ElMessage } from 'element-plus'
import { verifyPhone } from '@/api/auth.ts' 

import { useRoute, useRouter } from 'vue-router'
import { debounce } from '../../../util/index.ts'
import { phoneMethodConfig } from './window.size'
import { PhoneNumberAndCode } from '../../../types/auth'
import PhoneVerification from '../../../components/Auth/PhoneVerificationForm.vue'
import { initWindowConfig } from '../../../util/windowConfig'

const loading = ref(false)

const route = useRoute()
const router = useRouter()
const phoneNumber = route.query.phoneNumber

const phoneMethodFormRef = ref<InstanceType<typeof ElForm> | null>(null)

const phoneMethodValidationRules = {
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'change' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'change' }
  ]
}

onMounted(() => {
  initWindowConfig(phoneMethodConfig)
})

const phoneVerificationData = ref<PhoneNumberAndCode>({
  phoneNumber: '',
  code: ''
})

const nextStep = () => {
  if (!phoneMethodFormRef.value) return

  phoneMethodFormRef.value.validate((valid) => {
    if (!valid) return

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
          }
        }).finally(() => {
          loading.value = false
        })      
      } catch (error) {
        console.error(error)
        loading.value = false
      }
    }, 500)()
  })
}

</script>

<style scoped>
#container {
  width: calc(100% - 2px);
  height: calc(100% - 2px);
}

#phoneMethod-form {
  width: 100%;
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
