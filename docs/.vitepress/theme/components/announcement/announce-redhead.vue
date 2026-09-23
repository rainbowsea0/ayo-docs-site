<script setup lang="ts">
/**
 * 公告红头（发文机关 + 红色反线 + 发文字号）
 *
 * 纯展示：号码怎么算在 utils/announcement（L2），排版在 style/announce.css。
 */
defineProps<{
  /** 发文机关，如「国王号航行日志文件」 */
  org: string;
  /** 发文字号，如「国王号航行日志〔2026〕1号」 */
  no: string;
}>();
</script>

<template>
  <div class="ayo-announce__redhead">
    <div class="ayo-announce__org">{{ org }}</div>
    <div class="ayo-announce__line"></div>
    <div class="ayo-announce__no">{{ no }}</div>
  </div>
</template>
