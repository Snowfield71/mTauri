<template>
  <ElCard id="container">
      <p id="title">身份验证</p>
      <p id="subtitle">为了保护你的账号安全，需要验证你的身份，验证通过后即可找回你的密码</p>
    <div 
      class="methods-list" 
      v-for="(item, index) in findMethods" 
      :key="index" 
      @click="navTo(router, { name: item.name, query: item.queryParams })"
    >
      <img :src="item.imgSrc" alt="" srcset="">
      <div class="method-content">
        <p class="method-title">{{ item.title }}</p>
        <p class="method-description">{{ item.description}}</p>
      </div>
    </div>
  </ElCard>
</template>

<script setup lang="ts">
import { ElCard } from 'element-plus'
import { useRouter } from 'vue-router'
import { onMounted, computed } from 'vue'
import { navTo } from '../../../util/index'
import { findMethodsConfig } from './window.size'
import { UserInfoStore } from '@/store/user/user.store'
import { initWindowConfig } from '../../../util/windowConfig'
import type { FindMethodsCardContentData } from '../../../types/auth'

const router = useRouter()
const store = UserInfoStore()
const phoneNumber = ref('')

onMounted(() => {
  // 设置窗口大小
  initWindowConfig(findMethodsConfig)
  let storePhone = store.userInfo[0].phoneNumber

  if (storePhone) {
    phoneNumber.value = storePhone
  }
})

const desensitizedPhone = computed(() => {
  if (phoneNumber.value.length < 11) return phoneNumber.value
  return phoneNumber.value.replace(
    phoneNumber.value.substring(3, 9), 
    '******'
  )
})

const findMethods = computed<FindMethodsCardContentData[]>(() => [
  {
    name: 'PhoneMethod',
    queryParams: { phoneNumber: desensitizedPhone.value },
    title: '手机号',
    description: `通过${desensitizedPhone.value}接受短信验证码`,
    imgSrc: '/phone.png'
  },
  {
    name: 'PersonalDataMethod',
    title: '资料辅助验证',
    description: '填写账号信息与个人资料进行验证',
    imgSrc: '/personal_data.png'
  }
])

</script>

<style scoped>
p {
  margin: 0 auto;
}

#container {
  height: calc(100% - 2px);
}

#subtitle {
  margin: 5px 0 5px 0;
  font-size: 12px;
  color: #879ac4;
}

.methods-list {
  margin-top: 10px;
  display: flex; 
  align-items: center;
  border: 1px solid #eaeaea;
  padding: 20px;
  cursor: pointer;
}

.method-content {
  margin-left: 10px;
}

.method-title {
  font-size: 14px;
  font-weight: bold;
}

.method-description {
  font-size: 12px;
  color: #879ac4;
}
</style>