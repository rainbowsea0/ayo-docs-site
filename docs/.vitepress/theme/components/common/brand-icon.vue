<script setup lang="ts">
/**
 * 品牌图标（GitHub / 掘金）：按 icon 名渲染官方品牌路径的实心 svg
 *
 * 路径与颜色都在 L2 的 @theme/utils/brand-icons 里，这里只负责画：
 * 未登记的 icon 名不渲染任何东西（调用方按「没有图标」降级）。
 *
 * 图形是装饰性的：aria-hidden 屏蔽朗读，可访问名由旁边的文字承担；
 * 因此本组件不适合当作唯一的语义载体使用。
 */
import { computed } from "vue";
import { brandIcon } from "@theme/utils/brand-icons";

const props = withDefaults(
  defineProps<{
    /** socialLinks 里的 icon 名（如 github、juejin） */
    name: string;
    /** 边长（px）：卡片里与 13px 文字并排用 14 */
    size?: number;
  }>(),
  { size: 14 }
);

const brand = computed(() => brandIcon(props.name));
</script>

<template>
  <svg
    v-if="brand"
    class="ayo-brand-icon"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <path :d="brand.path" :fill="brand.color" />
  </svg>
</template>

<style scoped>
/* display:block 去掉 inline 元素基线下方的空隙，行内并排时高度才等于 size */
.ayo-brand-icon {
  display: block;
  flex-shrink: 0;
}
</style>
