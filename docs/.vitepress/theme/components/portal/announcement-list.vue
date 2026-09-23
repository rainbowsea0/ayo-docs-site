<script setup lang="ts">
/**
 * 公告列表（announcement/index.md 里的 <AnnouncementList />）
 * 数据来自构建期公告加载器：置顶优先、其余按日期倒序。
 */
import { withBase } from "vitepress";
import { data as announcements } from "@theme/data/announcements.data";
import type { AnnouncementItem } from "@theme/data/announcements.data";
import { sortAnnouncements } from "@theme/utils/announcement";
import { dateOnly } from "@theme/utils/format";

const items = sortAnnouncements(announcements as AnnouncementItem[]).map((item) => ({
  ...item,
  day: dateOnly(item.date),
}));
</script>

<template>
  <div class="ayo-announce-list">
    <p v-if="!items.length" class="ayo-announce-list__empty">
      暂无公告（新增 announcement/&lt;名字&gt;/index.md 即会自动出现）。
    </p>
    <ul v-else class="ayo-announce-list__items">
      <li v-for="item in items" :key="item.url" class="ayo-announce-list__item">
        <span class="ayo-announce-list__pin" :class="{ 'is-empty': !item.recommended }">置顶</span>
        <a class="ayo-announce-list__title" :href="withBase(item.url)">{{ item.title }}</a>
        <time class="ayo-announce-list__date">{{ item.day }}</time>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.ayo-announce-list__empty {
  padding: 20px;
  border: 1px dashed var(--ayo-line);
  color: var(--ayo-text-4);
  font-size: 13px;
  text-align: center;
}

.ayo-announce-list__items {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ayo-announce-list__item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: baseline;
  gap: 4px 8px;
  padding: 8px 0;
  border-bottom: 1px dashed var(--ayo-line);
}

.ayo-announce-list__item:last-child {
  border-bottom: none;
}

.ayo-announce-list__pin {
  flex-shrink: 0;
  padding: 0 6px;
  background-color: var(--ayo-primary-soft);
  color: var(--ayo-primary);
  font-size: 13px;
  line-height: 1.6;
}

.ayo-announce-list__pin.is-empty {
  visibility: hidden;
}

/* 公告标题是「条目名」：近黑，蓝色只给 hover（「置顶」标记的蓝不受影响，它是标记不是链接） */
.ayo-announce-list__title {
  color: var(--ayo-heading);
  text-decoration: none;
}

.ayo-announce-list__title:hover {
  color: var(--ayo-link-hover);
}

.ayo-announce-list__date {
  color: var(--ayo-text-4);
  font-size: 13px;
}
</style>
