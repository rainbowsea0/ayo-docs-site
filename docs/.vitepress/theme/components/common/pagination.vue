<script setup lang="ts">
/**
 * 老式分页条（« ‹ 1 2 … 9 › »）
 * 对应参考站 ui/RPagination
 */
import { computed } from "vue";
import AyoButton from "./button.vue";

const current = defineModel<number>("current", { default: 1 });

const props = withDefaults(
  defineProps<{
    total: number;
    pageSize?: number;
    siblings?: number;
    showFirstLast?: boolean;
  }>(),
  {
    pageSize: 10,
    siblings: 1,
    showFirstLast: true,
  }
);

const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));

/** 页码序列：当前页 ± siblings + 首末页，中间断层用 … 表示 */
const pages = computed<(number | "...")[]>(() => {
  const count = pageCount.value;
  const cur = Math.min(Math.max(1, current.value), count);
  const set = new Set<number>();
  for (let page = cur - props.siblings; page <= cur + props.siblings; page++) set.add(page);
  if (props.showFirstLast) {
    set.add(1);
    set.add(count);
  }
  const sorted = [...set].filter((page) => page >= 1 && page <= count).sort((a, b) => a - b);
  const out: (number | "...")[] = [];
  let prev = 0;
  for (const page of sorted) {
    if (page - prev > 1) out.push("...");
    out.push(page);
    prev = page;
  }
  return out;
});

const go = (page: number): void => {
  if (page < 1 || page > pageCount.value || page === current.value) return;
  current.value = page;
};
</script>

<template>
  <nav v-if="pageCount > 1" class="ayo-pagination" aria-label="分页">
    <AyoButton v-if="showFirstLast" size="sm" title="第一页" :disabled="current <= 1" @click="go(1)"
      >«</AyoButton
    >
    <AyoButton size="sm" title="上一页" :disabled="current <= 1" @click="go(current - 1)"
      >‹</AyoButton
    >

    <template v-for="(page, index) in pages" :key="index">
      <AyoButton v-if="page === '...'" size="sm" disabled class="ayo-pagination__ellipsis"
        >…</AyoButton
      >
      <AyoButton
        v-else
        size="sm"
        :class="{ 'is-current': page === current }"
        :title="`第 ${page} 页`"
        @click="go(page)"
        >{{ page }}</AyoButton
      >
    </template>

    <AyoButton size="sm" title="下一页" :disabled="current >= pageCount" @click="go(current + 1)"
      >›</AyoButton
    >
    <AyoButton
      v-if="showFirstLast"
      size="sm"
      title="最后一页"
      :disabled="current >= pageCount"
      @click="go(pageCount)"
      >»</AyoButton
    >
  </nav>
</template>

<style scoped>
.ayo-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 14px;
}

.ayo-pagination__ellipsis {
  pointer-events: none;
}

.ayo-pagination :deep(.is-current) {
  border-color: var(--ayo-primary);
  background: var(--ayo-primary);
  color: #fff;
}
</style>
