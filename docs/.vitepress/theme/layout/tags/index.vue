<script setup lang="ts">
/**
 * 标签归档页（frontmatter.layout: tags）
 *
 * 版式对齐参考站 TagsLayout：标签云 + 按标签分组的条目列表。
 * 分组 id 与文章页底部的标签链接（/tags/#slug）共用同一个 tagSlug，保证两端锚点一致。
 * 聚合来源：文章（posts 加载器）+ 知识库笔记（wiki 加载器），与参考站一致。
 */
import { computed } from "vue";
import { withBase } from "vitepress";
import { data as posts } from "@theme/data/posts.data";
import type { PostItem } from "@theme/data/posts.data";
import { data as wikiTopics } from "@theme/data/wiki.data";
import type { WikiTopic } from "@theme/data/wiki.data";
import { dateOnly } from "@theme/utils/format";
import { sortPostsByDate } from "@theme/utils/post";
import { groupByTag } from "@theme/utils/tag";
import type { TagSource } from "@theme/utils/tag";

const allPosts = computed<PostItem[]>(() => sortPostsByDate(posts as PostItem[]));

const postEntries = computed<TagSource[]>(() =>
  allPosts.value.map((post) => ({
    url: post.url,
    title: post.title,
    date: post.date,
    source: "post" as const,
    tags: post.tags,
  }))
);

/** 知识库笔记：日期取 updated（笔记没有发布时间概念） */
const wikiEntries = computed<TagSource[]>(() => {
  const list: TagSource[] = [];
  for (const topic of wikiTopics as WikiTopic[]) {
    for (const note of topic.notes) {
      if (!note.tags.length) continue;
      list.push({
        url: note.url,
        title: note.title,
        date: note.updated,
        source: "wiki",
        tags: note.tags,
      });
    }
  }
  return list;
});

const allEntries = computed<TagSource[]>(() => [...postEntries.value, ...wikiEntries.value]);

/** 分组、计数、组内外排序的口径都在 L2（utils/tag） */
const groups = computed(() => groupByTag(allEntries.value));

const descText = computed(
  () =>
    `共 ${postEntries.value.length} 篇文章、${wikiEntries.value.length} 篇知识库笔记，` +
    `${groups.value.length} 个标签，点击标签跳转到对应列表`
);
</script>

<template>
  <div class="ayo-tags">
    <h1 class="ayo-tags__title">🏷️ 标签</h1>
    <p class="ayo-tags__desc">{{ descText }}</p>

    <div v-if="groups.length" class="ayo-tags__cloud">
      <a v-for="group in groups" :key="group.slug" class="ayo-tags__chip" :href="`#${group.slug}`">
        #{{ group.tag }}
        <span class="ayo-tags__chip-count">{{ group.count }}</span>
      </a>
    </div>
    <p v-else class="ayo-tags__empty">
      暂无标签（文章 frontmatter 里写 tags: [标签A, 标签B] 即会出现在这里）。
    </p>

    <section v-for="group in groups" :id="group.slug" :key="group.slug" class="ayo-tags__section">
      <h2 class="ayo-tags__heading">
        <a class="ayo-tags__anchor" :href="`#${group.slug}`">#{{ group.tag }}</a>
        <span class="ayo-tags__heading-count">{{ group.count }}</span>
      </h2>
      <ul class="ayo-tags__list">
        <li v-for="entry in group.entries" :key="entry.url" class="ayo-tags__item">
          <a class="ayo-tags__link" :href="withBase(entry.url)">{{ entry.title }}</a>
          <span v-if="entry.date" class="ayo-tags__date">[{{ dateOnly(entry.date) }}]</span>
          <span v-else class="ayo-tags__source">知识库</span>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.ayo-tags {
  max-width: var(--ayo-page-width);
  margin: 0 auto;
  padding: 24px 24px 56px;
}

.ayo-tags__title {
  margin: 0 0 8px;
  color: var(--ayo-primary);
  font-size: 25px;
  line-height: 1.3;
}

.ayo-tags__desc {
  margin: 0 0 20px;
  color: var(--ayo-text-3);
  font-size: 13px;
}

.ayo-tags__cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
  padding: 16px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
  box-shadow: var(--ayo-shadow);
}

.ayo-tags__chip {
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
.ayo-tags__chip:visited {
  color: var(--ayo-heading);
}

.ayo-tags__chip:hover {
  border-color: var(--ayo-primary-line);
  background-color: var(--ayo-primary-soft);
  color: var(--ayo-link-hover);
}

.ayo-tags__chip-count {
  color: var(--ayo-text-5);
  font-size: 12px;
}

.ayo-tags__empty {
  padding: 24px;
  color: var(--ayo-text-4);
  font-size: 13px;
  text-align: center;
}

.ayo-tags__section {
  margin-bottom: 24px;
  scroll-margin-top: calc(var(--ayo-header-h, 0px) + 16px);
}

.ayo-tags__heading {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 10px;
  padding-bottom: 4px;
  border-bottom: 1px solid var(--ayo-line);
  color: var(--ayo-blue);
  font-size: 17px;
}

.ayo-tags__anchor {
  color: var(--ayo-heading);
  text-decoration: none;
}

.ayo-tags__anchor:visited {
  color: var(--ayo-heading);
}

.ayo-tags__anchor:hover {
  color: var(--ayo-link-hover);
}

.ayo-tags__heading-count {
  color: var(--ayo-text-5);
  font-size: 13px;
  font-weight: normal;
}

.ayo-tags__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ayo-tags__item {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 12px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
  transition:
    border-color var(--ayo-transition),
    background-color var(--ayo-transition);
}

.ayo-tags__item:hover {
  border-color: var(--ayo-primary-line);
  background-color: var(--ayo-bg-soft);
}

.ayo-tags__link {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--ayo-heading);
  text-decoration: none;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.ayo-tags__link:visited {
  color: var(--ayo-heading);
}

.ayo-tags__item:hover .ayo-tags__link {
  color: var(--ayo-link-hover);
}

.ayo-tags__date {
  flex-shrink: 0;
  color: var(--ayo-text-5);
  font-size: 12px;
}

.ayo-tags__source {
  flex-shrink: 0;
  padding: 0 4px;
  border: 1px solid currentcolor;
  color: var(--ayo-blue);
  font-size: 12px;
  line-height: 1.6;
  white-space: nowrap;
}

@media (max-width: 720px) {
  .ayo-tags {
    padding: 16px 12px 40px;
  }
}
</style>
