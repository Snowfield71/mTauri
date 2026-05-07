<template>
  <el-card v-loading="loading" id="container">
      <template #header>
        <span>找回密码</span>
      </template>
      <template #default>
        <p id="body-title">请输入账户</p>
        <el-input prop="account" v-model="account" placeholder="请输入账号" label-width="0" />
      </template>
      <template #footer>
        <el-button ref="buttonRef" :disabled="!account"  id="footer-button" type="primary" @click="nextStep">下一步</el-button>
      </template>
    </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElCard } from 'element-plus'
import { useRouter } from 'vue-router'
import { verifyPhone } from '@/api/auth.ts'
import { forgetPwdConfig } from './window.size'
import { debounce } from '../../../util/index.ts'
import { UserInfoStore } from '@/store/user/user.store'
import { initWindowConfig } from '../../../util/windowConfig'

const router = useRouter()
const store = UserInfoStore()

const loading = ref(false)

// 用户账户
let account = ref<string>('')

const nextStep = () => {
  loading.value = true

  debounce(async () => {
    try {
      if (!account.value) {
        ElMessage.warning('请输入手机号')
        loading.value = false
        return
      }

      verifyPhone({
        type: 'account',
        value: account.value,
        name: '账号',
      }).then((res: any) => {
        if (res.code === 409) {
          ElMessage.success('验证成功')
          router.push({ name: 'FindMethods'})
        } else {
          ElMessage.warning('验证失败')
        }
      })
    } finally {
      loading.value = false
    }
  }, 500)()
}

onMounted(() => {
  initWindowConfig(forgetPwdConfig)

  account.value = store.getUserInfo()[0].account
})
</script>

<style scoped>
#container {
  display: flex;
  flex-direction: column;
  height: calc(100% - 2px);
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