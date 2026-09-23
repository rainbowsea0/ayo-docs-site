<script setup lang="ts">
/**
 * 站点按钮：直角 + 细边框，皮肤在 style/atoms.css 的 .ayo-btn 原语里
 * 对应参考站 ui/RButton
 *
 * 传了 href 就渲染成 <a>（列表行末的「阅读全文」这类入口是链接不是表单控件），
 * 没传就是 <button>。两种形态共用同一套 class，皮肤只有一份。
 */
withDefaults(
  defineProps<{
    /**
     * default = 浅底描边（搜索、次级操作）
     * primary = 主色实心（「阅读全文」这类主要入口）
     * channel = 频道条内；bar = 频道条右端强调
     */
    variant?: "default" | "primary" | "channel" | "bar";
    /** xs = 列表行末；sm = 工具条；md = 表单默认 */
    size?: "xs" | "sm" | "md";
    /** 传了就渲染成链接 */
    href?: string;
    /** 展开态高亮 */
    active?: boolean;
    type?: "button" | "submit";
  }>(),
  {
    variant: "default",
    size: "md",
    type: "button",
  }
);
</script>

<template>
  <a v-if="href" class="ayo-btn" :class="[`ayo-btn--${variant}`, `ayo-btn--${size}`]" :href="href">
    <slot />
  </a>
  <button
    v-else
    class="ayo-btn"
    :class="[`ayo-btn--${variant}`, `ayo-btn--${size}`, { 'is-open': active }]"
    :type="type"
  >
    <slot />
  </button>
</template>
