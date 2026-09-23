<script setup lang="ts">
/**
 * 状态徽章（计划中 = 橙 / 更新中 = 蓝 / 其余 = 绿）
 * 对应参考站 ui/RBadge；项目列表与项目页用它标 frontmatter.status。
 */
import { computed } from "vue";

const props = defineProps<{ status?: string }>();

const visible = computed(() => Boolean(props.status?.trim()));

const tone = computed(() => {
  const status = props.status?.trim();
  if (status === "计划中") return "planning";
  if (status === "更新中") return "updating";
  return "done";
});
</script>

<template>
  <span v-if="visible" class="ayo-badge" :class="`ayo-badge--${tone}`">{{ status }}</span>
</template>

<style scoped>
.ayo-badge {
  flex-shrink: 0;
  padding: 0 4px;
  border: 1px solid currentcolor;
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
}

.ayo-badge--planning {
  color: var(--ayo-amber-dark);
}

.ayo-badge--updating {
  color: var(--ayo-blue);
}

.ayo-badge--done {
  color: var(--ayo-green);
}
</style>
