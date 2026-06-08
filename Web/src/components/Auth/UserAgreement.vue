<template>
  <div id="form-checkbox" @click="toggleAgreement">
     <el-checkbox :model-value="agreementAccepted" />
     <span id="form-agree" tabindex="-1">
        已经阅读并同意<a href="#" tabindex="-1"> 服务协议 </a>和<a href="#" tabindex="-1"> 隐私保护指引</a>
     </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  agreementAccepted: {
    type: Boolean,
    required: true
  },
})

const emit = defineEmits<{
  (e: 'update:agreementAccepted', value: boolean): void
}>()

const toggleAgreement = () => {
  emit('update:agreementAccepted', !props.agreementAccepted)
}
</script>

<style scoped>
a {
    text-decoration: none;
    color: #57a7f3 !important;
  }

#form-checkbox {
  display: flex;
  align-items: center;
  gap: 4px;
  line-height: 32px;
  margin-top: -10px; 
  margin-bottom: 10px;
}

#form-checkbox :deep(.el-radio) {
  margin-right: 0;
  height: 32px;
  display: flex;
  align-items: center;
}

#form-checkbox :deep(.el-radio__input) {
  margin-top: 0;
}

#form-agree {
  font-size: 12px; 
  line-height: 1;
}
</style>