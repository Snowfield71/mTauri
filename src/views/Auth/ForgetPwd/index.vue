<template>
  <el-card v-loading="loading" id="container">
      <template #header>
        <span>找回密码</span>
      </template>
      <template #default>
        <el-form
          ref="forgetPwdFormRef"
          :model="form"
          :rules="forgetPwdValidationRules"
          id="forgetPwd-form"
          @submit.prevent="nextStep"
        >
          <p id="body-title">请输入账户</p>
          <el-input
            prop="account"
            v-model="form.account"
            placeholder="请输入账号"
            label-width="0"
          />
        </el-form>
      </template>
      <template #footer>
        <el-button
          :disabled="!form.account"
          id="footer-button"
          type="primary"
          @click="nextStep"
        >
          下一步
        </el-button>
      </template>
    </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCard, ElForm, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { verifyPhone } from '@/api/auth.ts'
import { forgetPwdConfig } from './window.size'
import { debounce } from '../../../util/index.ts'
import { UserInfoStore } from '@/store/user/user.store'
import { initWindowConfig } from '../../../util/windowConfig'

const router = useRouter()
const store = UserInfoStore()

const forgetPwdFormRef = ref<InstanceType<typeof ElForm> | null>(null)

const loading = ref(false)

const form = ref({
  account: ''
})

const forgetPwdValidationRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'change' }
  ]
}

const nextStep = () => {
  if (!forgetPwdFormRef.value) return

  forgetPwdFormRef.value.validate((valid) => {
    if (!valid) return

    loading.value = true

    debounce(async () => {
      try {
        verifyPhone({
          type: 'account',
          value: form.value.account,
          name: '账号',
        }).then((res: any) => {
          if (res.code === 409) {
            ElMessage.success('验证成功')
            router.push({ 
              name: 'FindMethods',
              query: {
                account: form.value.account
              }
            })
          } else {
            ElMessage.warning('验证失败')
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

onMounted(() => {
  initWindowConfig(forgetPwdConfig)

  const savedAccounts = store.getUserInfo()
  if (savedAccounts.length > 0) {
    form.value.account = savedAccounts[0].account
  }
})
</script>

<style scoped>
#container {
  width: calc(100% - 2px);
  height: calc(100% - 2px);
}

#body-title {
  margin: 10px 0;
}

#footer-button {
  width: 100%;
}

#diglog {
  position: relative;
  width: 100%;
  height: 150px;
  background: #525252;
}

.slider-size {
  width: 50px;
  height: 50px;
}

#random-slider {
  position: absolute;
  background: #8c8c8c;
}

#follow-slider {
  background: #409eff;
}

#match-slider {
  margin-top: 10px;
  background: #525252;
}
</style>
