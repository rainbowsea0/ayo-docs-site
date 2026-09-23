<script setup lang="ts">
/**
 * 老式细边框输入框
 * 对应参考站 ui/RInput；样式主体在 style/base.css 的 .ayo-input 原语里
 */
const model = defineModel<string>({ default: "" });

withDefaults(defineProps<{ placeholder?: string }>(), { placeholder: "" });
</script>

<template>
  <input
    v-model="model"
    class="ayo-input"
    type="text"
    :placeholder="placeholder"
    autocomplete="off"
  />
</template>
