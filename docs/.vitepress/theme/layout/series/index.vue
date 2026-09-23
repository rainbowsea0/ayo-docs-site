<script setup lang="ts">
/**
 * 系列文章页（frontmatter.layout: series）
 *
 * 版式对齐参考站 SeriesLayout：系列云 + 每个系列按章节顺序列出全部篇章。
 * 归入系列的条件与首页右栏「系列文章」挂件一致：series.name 非空且 series.order > 0。
 */
import { computed } from "vue";
import { withBase } from "vitepress";
import { data as posts } from "@theme/data/posts.data";
import type { PostItem } from "@theme/data/posts.data";
import { dateOnly, seriesSlug } from "@theme/utils/format";
import { groupPostsBySeries } from "@theme/utils/post";

interface SeriesGroup {
  name: string;
  slug: string;
  count: number;
  posts: PostItem[];
}

/** 聚合与排序口径全在 L2：系列界定条件、章节顺序、系列间排序都只有一份实现 */
const groups = computed<SeriesGroup[]>(() =>
  groupPostsBySeries(posts as PostItem[]).map((group) => ({
    name: group.name,
    slug: seriesSlug(group.name),
    count: group.posts.length,
    posts: group.posts,
  }))
);

const totalChapters = computed(() => groups.value.reduce((sum, group) => sum + group.count, 0));
</script>

<template>
  <div class="ayo-series">
    <h1 class="ayo-series__title">📚 系列文章</h1>
    <p class="ayo-series__desc">
      共 {{ groups.length }} 个系列、{{ totalChapters }} 篇 ·
      每篇按章节排列，点击系列名可跳转到该系列
    </p>

    <div v-if="groups.length" class="ayo-series__cloud">
      <a
        v-for="group in groups"
        :key="group.slug"
        class="ayo-series__chip"
        :href="`#${group.slug}`"
      >
        {{ group.name }}
        <span class="ayo-series__chip-count">{{ group.count }}</span>
      </a>
    </div>
    <p v-else class="ayo-series__empty">
      暂无系列文章（frontmatter 写 series: { name, order, title } 即会出现在这里）。
    </p>

    <section v-for="group in groups" :id="group.slug" :key="group.slug" class="ayo-series__section">
      <h2 class="ayo-series__heading">
        <a class="ayo-series__anchor" :href="`#${group.slug}`">{{ group.name }}</a>
        <span class="ayo-series__heading-count">{{ group.count }} 章</span>
      </h2>
      <ul class="ayo-series__list">
        <li v-for="(post, index) in group.posts" :key="post.url" class="ayo-series__item">
          <span class="ayo-series__order">{{ String(index + 1).padStart(2, "0") }}</span>
          <a class="ayo-series__link" :href="withBase(post.url)" :title="post.title">{{
            post.title
          }}</a>
          <span v-if="post.date" class="ayo-series__date">[{{ dateOnly(post.date) }}]</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.ayo-series {
  max-width: var(--ayo-page-width);
  margin: 0 auto;
  padding: 24px 24px 56px;
}

.ayo-series__title {
  margin: 0 0 8px;
  color: var(--ayo-primary);
  font-size: 25px;
  line-height: 1.3;
}

.ayo-series__desc {
  margin: 0 0 20px;
  color: var(--ayo-text-3);
  font-size: 13px;
}

.ayo-series__cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
  padding: 16px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
  box-shadow: var(--ayo-shadow);
}

.ayo-series__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 10px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg-soft);
  color: var(--ayo-heading);
  font-size: 13px;
  text-decoration: none;
  transition:
    border-color var(--ayo-transition),
    background-color var(--ayo-transition);
}

/* 取消「看过变灰」：本页只有 hover 一个状态（链接口径见 style/var.css） */
.ayo-series__chip:visited {
  color: var(--ayo-heading);
}

.ayo-series__chip:hover {
  border-color: var(--ayo-primary-line);
  background-color: var(--ayo-primary-soft);
  color: var(--ayo-link-hover);
}

.ayo-series__chip-count {
  color: var(--ayo-text-5);
  font-size: 12px;
}

.ayo-series__empty {
  padding: 24px;
  color: var(--ayo-text-4);
  font-size: 13px;
  text-align: center;
}

.ayo-series__section {
  margin-bottom: 24px;
  scroll-margin-top: calc(var(--ayo-header-h, 0px) + 16px);
}

.ayo-series__heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--ayo-line);
  color: var(--ayo-blue);
  font-size: 17px;
}

.ayo-series__anchor {
  color: var(--ayo-heading);
  text-decoration: none;
}

.ayo-series__anchor:visited {
  color: var(--ayo-heading);
}

.ayo-series__anchor:hover {
  color: var(--ayo-link-hover);
}

.ayo-series__heading-count {
  color: var(--ayo-text-5);
  font-size: 13px;
  font-weight: normal;
}

.ayo-series__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ayo-series__item {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
  transition:
    border-color var(--ayo-transition),
    background-color var(--ayo-transition);
}

.ayo-series__item:hover {
  border-color: var(--ayo-primary-line);
  background-color: var(--ayo-bg-soft);
}

.ayo-series__order {
  flex-shrink: 0;
  color: var(--ayo-text-5);
  font-family: var(--ayo-font-mono);
  font-size: 12px;
}

.ayo-series__link {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--ayo-heading);
  text-decoration: none;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ayo-series__link:visited {
  color: var(--ayo-heading);
}

.ayo-series__item:hover .ayo-series__link {
  color: var(--ayo-link-hover);
}

.ayo-series__date {
  flex-shrink: 0;
  color: var(--ayo-text-5);
  font-size: 12px;
}

@media (max-width: 720px) {
  .ayo-series {
    padding: 16px 12px 40px;
  }
}
</style>
