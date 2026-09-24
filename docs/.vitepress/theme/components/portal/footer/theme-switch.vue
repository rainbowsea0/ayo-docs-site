<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useData } from "vitepress";

const { isDark } = useData();

const mounted = ref(false);

onMounted(() => {
  mounted.value = true;
});

const label = computed(() => (mounted.value && isDark.value ? "亮色模式" : "暗色模式"));

const actionLabel = computed(() => `切换到${label.value}`);

const toggle = (): void => {
  isDark.value = !isDark.value;
};
</script>

<template>
  <button
    class="ayo-theme-switch"
    type="button"
    :title="actionLabel"
    :aria-label="actionLabel"
    :aria-pressed="mounted && isDark"
    @click="toggle"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.ayo-theme-switch {
  padding: 0;
  border: 0;
  background: none;
  color: var(--ayo-text-2);
  font-family: inherit;
  font-size: 12px;
  line-height: inherit;
  cursor: pointer;
  transition: color var(--ayo-transition);
}

.ayo-theme-switch:hover {
  color: var(--ayo-link);
}
</style>
