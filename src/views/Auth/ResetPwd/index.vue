<template>
  <el-card v-loading="loading" id="container">
      <p id="title">找回密码</p>
      <p id="subtitle">设置新密码</p>

      <el-form
        ref="formRef"
        :model="form"
        status-iconf
        :rules="rules"
        label-width="auto"
        class="form"
      >
        <el-form-item prop="password">
          <el-input
            placeholder="请输入新密码"
            v-model="form.password" 
            type="password" 
            autocomplete="off" />
        </el-form-item>
        <el-form-item prop="newPassword">
          <el-input
            placeholder="请再次输入新密码"
            v-model="form.newPassword"
            type="password"
            autocomplete="off"
          />
        </el-form-item>
        <el-form-item>
          <div class="btn-item">
            <el-button
              class="btn"
              :disabled="!(form.password.length >= 6 && form.newPassword.length >= 6)"
              type="primary" @click="submitForm(formRef)">
                确定
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </el-card>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
  import { useRoute } from 'vue-router'
  import { invoke } from '@tauri-apps/api/core'
  import { resetPassword } from '@/api/auth.ts'
  import { debounce } from '../../../util/index.ts'
  import { ElForm, FormInstance } from 'element-plus'

  const route = useRoute()
  const formRef = ref<FormInstance>()

  const loading = ref(false)

  const phoneNumber = (route.query.phoneNumber as string) || ''

  const rules = {
    password: [
      { required: true, message: '请输入密码', trigger: 'change' },
      { min: 6, message: '密码长度不能小于6位', trigger: 'change' }
    ],
    newPassword: [
      { required: true, message: '请输入密码', trigger: 'change' },
      { min: 6, message: '密码长度不能小于6位', trigger: 'change' }
    ],
  }

  const form = ref({
    password: '',
    newPassword: ''
  })

  const submitForm = ( formEl: FormInstance | undefined ) => {
    loading.value = true

    debounce(async () => {
    try {
      if (!formEl) return

      if (form.value.password != form.value.newPassword) {
        ElMessage.warning('两次输入密码不一致')
        return
      }

      resetPassword(phoneNumber, form.value.newPassword).then((res: any) => {
        if (res.code === 200) {
          ElMessage.success('密码重置成功')

          setTimeout(() => {
            invoke('close_window').catch(err => {
              console.error('关闭窗口失败:', err)
            })
          }, 2000)
        } else {
          ElMessage.warning('密码重置失败')
        }
      })
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

  #subtitle {
    margin: 5px 0 5px 0;
    font-size: 14px;
  }

  .form {
    margin-top: 20px;
  }

  .btn-item {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .btn {
    width: 100%;
  }
</style>