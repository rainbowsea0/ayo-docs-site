<script setup lang="ts">
/**
 * 系列目录（系列文章页面左栏）
 *
 * 形态对齐参考站 SeriesSideNav：
 *   - 卡片标题就是**系列名**（过长省略），右上角 note 显示 **当前章 / 总章数** 进度；
 *   - 列表每行是「两位序号 + 章节短标题（frontmatter 的 series.title）」，
 *     没填短标题才回退文章全标题；
 *   - 当前章**整行浅底高亮** + 主色加粗。
 * 数据由文档页布局传进来（它已经算好分支与顺序），本组件只负责渲染。
 */
import { computed } from "vue";
import { withBase } from "vitepress";
import { AyoCard } from "@theme/components/common";
import type { PostItem } from "@theme/data/posts.data";
import { postSeriesTitle, seriesIndexOf } from "@theme/utils/post";

const props = defineProps<{
  /** 系列名 */
  name: string;
  /** 同系列文章（已按 order 排好序） */
  chapters: PostItem[];
  /** 当前页路径，用于定位「当前章」 */
  currentUrl: string;
}>();

/** 当前章位次（1 起；0 = 没匹配到，说明这篇不在系列里） */
const currentNo = computed(() => seriesIndexOf(props.chapters, props.currentUrl));

/** 章节显示名：优先 frontmatter 的章节短标题（解析规则在 L2） */
const labelOf = (post: PostItem): string => postSeriesTitle(post);
</script>

<template>
  <AyoCard :title="name" :note="`${currentNo} / ${chapters.length}`">
    <ul class="ayo-series-side">
      <li
        v-for="(post, index) in chapters"
        :key="post.url"
        class="ayo-series-side__item"
        :class="{ 'is-active': index + 1 === currentNo }"
      >
        <span class="ayo-series-side__order">{{ String(index + 1).padStart(2, "0") }}</span>
        <a class="ayo-series-side__link" :href="withBase(post.url)" :title="post.title">{{
          labelOf(post)
        }}</a>
      </li>
    </ul>
  </AyoCard>
</template>

<style scoped>
/* 系列名可能很长：标题占满一行时省略，右侧进度不被挤掉 */
:deep(.ayo-card__title) {
  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ayo-series-side {
  margin: 0;
  padding: 2px 0 0;
  list-style: none;
}

.ayo-series-side__item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  font-size: 13px;
}

.ayo-series-side__item.is-active {
  background-color: var(--ayo-primary-soft);
}

.ayo-series-side__order {
  flex-shrink: 0;
  color: var(--ayo-text-5);
  font-size: 12px;
}

.ayo-series-side__link {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--ayo-heading);
  white-space: nowrap;
  text-overflow: ellipsis;
  text-decoration: none;
}

/* 取消「看过变灰」：本栏只有 .is-active（当前章节）是蓝的，其余近黑 */
.ayo-series-side__link:visited {
  color: var(--ayo-heading);
}

.ayo-series-side__link:hover {
  color: var(--ayo-link-hover);
}

.ayo-series-side__item.is-active .ayo-series-side__link {
  color: var(--ayo-primary);
  font-weight: bold;
  text-decoration: none;
}
</style>
