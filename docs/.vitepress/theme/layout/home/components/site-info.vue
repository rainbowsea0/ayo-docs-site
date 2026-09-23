<script setup lang="ts">
/**
 * 站点信息挂件
 *
 * 参考站展示「运行时间」（自建站日起算），本项目配置里没有建站日期，
 * 因此改为全部由构建期文章数据推导，不编造数值。
 */
import { computed } from "vue";
import { AyoCard } from "@theme/components/common";
import { dateOnly, daysSince, formatDuration } from "@theme/utils/format";
import { data as posts } from "@theme/data/posts.data";
import type { PostItem } from "@theme/data/posts.data";

const allPosts = computed<PostItem[]>(() => posts as PostItem[]);

/** 全部发布时间（升序）：运行时间的起点与最近更新都从这一份排序结果里取 */
const dates = computed(() =>
  allPosts.value
    .map((post) => post.date)
    .filter(Boolean)
    .sort()
);

/** 最早一篇的发布时间：作为「运行时间」起点 */
const firstDate = computed(() => dates.value[0] ?? "");

/** 距首篇发布的天数（无文章时为 -1） */
const uptimeDays = computed(() => (firstDate.value ? daysSince(firstDate.value) : -1));

const uptime = computed(() => (uptimeDays.value >= 0 ? formatDuration(uptimeDays.value) : "--"));

/** 运行时间一行的悬停提示：右栏只有 216px，起算口径放不进标签里，改挂在行上 */
const uptimeTitle = computed(() =>
  uptimeDays.value >= 0
    ? `自首篇 ${dateOnly(firstDate.value)} 发布起算，共 ${uptimeDays.value} 天`
    : "还没有已发布文章"
);

const latestDate = computed(() => dateOnly(dates.value[dates.value.length - 1] ?? ""));
</script>

<template>
  <AyoCard title="站点信息">
    <ul class="ayo-list ayo-info">
      <li>
        <span class="ayo-info__label">收录文章：</span>
        <span class="ayo-info__value"
          ><span class="ayo-count">{{ allPosts.length }}</span> 篇</span
        >
      </li>
      <li :title="uptimeTitle">
        <span class="ayo-info__label">运行时间：</span>
        <span class="ayo-info__value"
          ><span class="ayo-count">{{ uptime }}</span></span
        >
      </li>
      <li>
        <span class="ayo-info__label">最近更新：</span>
        <span class="ayo-info__value"
          ><span class="ayo-count">{{ latestDate || "--" }}</span></span
        >
      </li>
    </ul>
  </AyoCard>
</template>

<style scoped>
/* 站点信息是「标签 + 数值」两列。
   每行必须只有**两个**弹性项：数字与单位（「8 篇」）要待在同一个 .ayo-info__value 里，
   否则 space-between 会把「篇」甩到行尾、和数字分居两端。
   标签一律单行——右栏内宽只有 192px，「运行时间（自首篇发布）」那种长标签会折成两行。 */
.ayo-info {
  /* 卡片正文统一 12px */
  font-size: 12px;
}

.ayo-info > li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  padding: 3px 0;
}

.ayo-info > li:hover {
  background-color: transparent;
}

.ayo-info__label,
.ayo-info__value {
  white-space: nowrap;
}

.ayo-info__value {
  flex-shrink: 0;
  text-align: right;
}
</style>
