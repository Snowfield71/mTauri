<template>
  <el-form-item :prop="prop" :label-width="labelWidth">
    <el-input
      :class="inputClass"
      :placeholder="placeholder"
      :value="modelValue"
      :type="type"
      :disabled="disabled"
      :maxlength="maxlength"
      :prefix-icon="prefixIcon"
      :suffix-icon="suffixIcon"
      @input="handleInput"
      @clear="handleClear"
    >
      <template #prefix>
        <slot name="prefix"></slot>
      </template>
      <template #suffix v-if="showSuffixIcon">
        <slot name="suffix"></slot>
      </template>
    </el-input>
  </el-form-item>
</template>

<script setup lang="ts">
defineProps({
  prop: { type: String, required: true },
  modelValue: { type: String, required: true },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  labelWidth: { type: String, default: '0' },
  disabled: { type: Boolean, default: false },
  maxlength: { type: Number },
  prefixIcon: { type: Object },
  suffixIcon: { type: Object },
  inputClass: { type: String, default: '' },
  showSuffixIcon: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'input', 'clear']);

const handleInput = (value: string) => {
  emit('update:modelValue', value);
  emit('input', value);
};

const handleClear = () => {
  emit('update:modelValue', '');
  emit('clear');
};
</script>