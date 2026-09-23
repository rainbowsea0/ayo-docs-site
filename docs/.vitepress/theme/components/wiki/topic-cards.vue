<script setup lang="ts">
/**
 * 知识库主页主题卡（wiki/index.md 里的 <wiki-topic-cards />）
 * 数据来自构建期 wiki 加载器：新增主题只写 md，卡片与计数自动出现。
 */
import { computed } from "vue";
import { withBase } from "vitepress";
import { data as topics } from "@theme/data/wiki.data";
import type { WikiTopic } from "@theme/data/wiki.data";

const list = computed<WikiTopic[]>(() => topics as WikiTopic[]);

/** 主题页与各笔记里最新的 updated，没有则空串 */
const latestUpdated = (topic: WikiTopic): string => {
  let max = topic.updated;
  for (const note of topic.notes) {
    if (note.updated && note.updated > max) max = note.updated;
  }
  return max;
};
</script>

<template>
  <div class="ayo-wiki-hub">
    <p v-if="!list.length" class="ayo-wiki-hub__empty">
      暂无主题（新增 wiki/&lt;主题&gt;/index.md 即会自动出现）。
    </p>
    <div v-else class="ayo-wiki-hub__grid">
      <a
        v-for="topic in list"
        :key="topic.slug"
        class="ayo-wiki-hub__card"
        :href="withBase(topic.url)"
      >
        <div class="ayo-wiki-hub__head">
          <span class="ayo-wiki-hub__title">{{ topic.title }}</span>
          <span class="ayo-wiki-hub__count">{{ topic.notes.length }} 篇笔记</span>
        </div>
        <p v-if="topic.summary" class="ayo-wiki-hub__summary">{{ topic.summary }}</p>
        <p v-else class="ayo-wiki-hub__summary ayo-wiki-hub__summary--none">（暂无主题简介）</p>
        <div class="ayo-wiki-hub__foot">
          <span class="ayo-wiki-hub__updated-label">最近更新</span>
          <span v-if="latestUpdated(topic)" class="ayo-wiki-hub__updated">{{
            latestUpdated(topic)
          }}</span>
          <span v-else class="ayo-wiki-hub__updated ayo-wiki-hub__updated--none">持续更新中</span>
        </div>
      </a>
    </div>
  </div>
</template>

<style scoped>
.ayo-wiki-hub {
  margin-top: 8px;
}

.ayo-wiki-hub__empty {
  padding: 20px;
  border: 1px dashed var(--ayo-line);
  color: var(--ayo-text-4);
  font-size: 13px;
  text-align: center;
}

.ayo-wiki-hub__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.ayo-wiki-hub__card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 168px;
  padding: 16px 18px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
  text-decoration: none;
  box-shadow: var(--ayo-shadow);
  transition:
    border-color var(--ayo-transition),
    box-shadow var(--ayo-transition),
    transform var(--ayo-transition);
}

.ayo-wiki-hub__card:hover {
  border-color: var(--ayo-primary-line);
  box-shadow: var(--ayo-shadow-hover);
  transform: translateY(-2px);
}

.ayo-wiki-hub__head {
  display: flex;
  flex-shrink: 0;
  align-items: baseline;
  gap: 8px;
}

/* 卡片标题是「条目名」不是「按钮」：近黑，蓝色只给 hover（链接口径见 style/var.css） */
.ayo-wiki-hub__title {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--ayo-heading);
  font-size: 17px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* 取消「看过变灰」：卡片只有 hover 一个状态，已访问与未访问同色 */
.ayo-wiki-hub__card:visited .ayo-wiki-hub__title {
  color: var(--ayo-heading);
}

.ayo-wiki-hub__card:hover .ayo-wiki-hub__title {
  color: var(--ayo-link-hover);
}

.ayo-wiki-hub__count {
  flex-shrink: 0;
  color: var(--ayo-text-5);
  font-size: 12px;
}

.ayo-wiki-hub__summary {
  flex: 1 1 auto;
  margin: 6px 0 10px;
  color: var(--ayo-text-2);
  font-size: 13px;
  line-height: 1.7;
}

.ayo-wiki-hub__summary--none {
  color: var(--ayo-text-5);
}

.ayo-wiki-hub__foot {
  display: flex;
  flex-shrink: 0;
  align-items: baseline;
  gap: 8px;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px dashed var(--ayo-line);
}

.ayo-wiki-hub__updated-label {
  flex-shrink: 0;
  color: var(--ayo-text-5);
  font-size: 12px;
}

.ayo-wiki-hub__updated {
  margin-left: auto;
  color: var(--ayo-blue);
  font-size: 12px;
  white-space: nowrap;
}

.ayo-wiki-hub__updated--none {
  color: var(--ayo-text-5);
}
</style>
