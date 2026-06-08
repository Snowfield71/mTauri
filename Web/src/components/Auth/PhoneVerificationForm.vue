<template>
  <el-form-item>
    <div class="input-wrapper"
      :style="{ width: containerWidth }">
      <el-select
        class="area-select"
        v-model="selectedAreaCode"
        :teleported="false"
        popper-class="custom-popper"
        placement="bottom"
        :value-key="'code'"
      >
        <template #prefix>+</template>
        <el-scrollbar :height="scrollbarHeight">
          <el-option
            class="option-item"
            v-for="(item, index) in areaCodeOptions"
            :key="index"
            :label="item.code"
            :value="item.code"
          >
            +{{ item.code }} {{ item.name }}
          </el-option>
        </el-scrollbar>
      </el-select>
      <el-input
        class="phone-input"
        v-model="localPhoneNumber"
        placeholder="请输入手机号"
        @focus="isInputFocused = true"
        clearable
      />
    </div>
  </el-form-item>
  <el-form-item v-show="isInputFocused">
    <div class="input-wrapper">
      <el-input
        class="code-input"
        :style="{ width: codeInputWidth }"
        v-model="localCode"
        placeholder="短信验证码"
      />
      <el-button v-if="!isSendCode" class="send-code" @click="sendCode">发送验证码</el-button>
      <span v-else plain disabled class="code-time">{{ time }}</span>
    </div>
  </el-form-item>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { AreaCodeData } from '../../types/auth'
import { ElMessage } from 'element-plus'

const props = defineProps({
  phoneNumber: { type: String, default: '' },
  code: { type: String, default: '' },
  containerWidth: { type: String, default: '100%' },
  codeInputWidth: { type: String, default: '100%' },
  isPhoneInputFocused: {type: Boolean, default: false}
})

const isInputFocused = ref(props.isPhoneInputFocused)

const emit = defineEmits(['update:phoneNumber', 'update:code', 'code-generated'])

const areaCodeOptions = ref<AreaCodeData[]>([
  { code: '86', name: '中国' },
  { code: '87', name: '美国' },
  { code: '88', name: '日本' },
  { code: '89', name: '韩国' },
  { code: '90', name: '英国' },
  { code: '91', name: '法国' },
  { code: '92', name: '德国' },
  { code: '93', name: '意大利' },
])

const selectedAreaCode = ref<string>(areaCodeOptions.value[0].code)
const scrollbarHeight = ref<string>('150px')

const localPhoneNumber = ref(props.phoneNumber)
const localCode = ref(props.code)

const time = ref<number>(60)
const isSendCode = ref<boolean>(false)

watch(localPhoneNumber, (newVal) => {
  emit('update:phoneNumber', newVal)
})

watch(localCode, (newVal) => {
  emit('update:code', newVal)
})

const sendCodeTimer = () => {
  const interval = setInterval(() => {
    if (time.value <= 0) {
      time.value = 60
      isSendCode.value = false
      clearInterval(interval)
    }
    time.value--
  }, 1000)
}

const sendCode = () => {
  if (!localPhoneNumber.value) {
    ElMessage({
      message: '请输入手机号',
      type: 'warning'
    })
    return
  }
  isSendCode.value = true
  time.value = 60
  sendCodeTimer()
}
</script>

<style scoped>
.input-wrapper {
  display: flex;
  gap: 8px;
}

.area-select {
  flex: 0 0 auto;
  width: 100px;
}

.option-item {
  width: 100px;
}

.phone-input,
.code-time {
  flex: 1;
}

.send-code,
.code-time {
  color: #57a7f3;
  width: 100px;
}

.code-time {
  text-align: center;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #dcdfe6;
}
</style>