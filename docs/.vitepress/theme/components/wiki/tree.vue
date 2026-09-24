<script setup lang="ts">
/**
 * 知识库目录树（左栏 / 知识库页面专用）
 *
 * 数据来自构建期 wiki 加载器：主题可折叠，当前所在主题默认展开，
 * 当前主题/笔记高亮。是否显示由调用方（文档页布局）决定。
 */
import { computed, reactive } from "vue";
import { withBase } from "vitepress";
import { useCurrentUrl } from "@theme/composables/use-current-url";
import { AyoCard } from "@theme/components/common";
import { data as topics } from "@theme/data/wiki.data";
import type { WikiNote, WikiTopic } from "@theme/data/wiki.data";
import { normalizeUrl } from "@theme/utils/format";

/** 当前路径：与加载器 url 同口径（去掉 base），见 useCurrentUrl */
const currentUrl = useCurrentUrl();

const tree = computed<WikiTopic[]>(() => topics as WikiTopic[]);

/** 统一成「无尾斜杠、无 .html、无 index」的形态再比较，两端写法不一致也能对上 */
const normalize = (path: string): string =>
  normalizeUrl(path)
    .replace(/\/index$/, "")
    .replace(/\/+$/, "");

const isActive = (url: string): boolean => normalize(currentUrl.value) === normalize(url);

const topicActive = (topic: WikiTopic): boolean =>
  isActive(topic.url) || topic.notes.some((note) => isActive(note.url));

const activeSlug = computed(() => tree.value.find((topic) => topicActive(topic))?.slug ?? "");

const expanded = reactive(new Set<string>());

const isOpen = (slug: string): boolean => expanded.has(slug) || activeSlug.value === slug;

/** 折叠按钮的无障碍标签：在脚本里拼好，避免模板属性里再嵌一层引号 */
const toggleLabel = (topic: WikiTopic): string =>
  `${isOpen(topic.slug) ? "折叠" : "展开"}${topic.title}`;

const toggle = (slug: string): void => {
  if (expanded.has(slug)) {
    expanded.delete(slug);
  } else {
    expanded.add(slug);
  }
};

/**
 * 这个位置要不要插一行分组小标题
 *
 * 笔记已按「分组 → order」排好（见 wiki.data.ts 的 byGroupThenOrder），同组是连续块，
 * 所以「分组名与上一篇不同」就是组的起点；未写 group 的笔记（整体排在最后）不插标题。
 */
const isGroupStart = (notes: WikiNote[], index: number): boolean =>
  Boolean(notes[index]?.group) && notes[index]?.group !== notes[index - 1]?.group;
</script>

<template>
  <AyoCard title="知识库目录">
    <p v-if="!tree.length" class="ayo-wiki-tree__empty">知识库暂无主题</p>
    <ul v-else class="ayo-wiki-tree">
      <li v-for="topic in tree" :key="topic.slug" class="ayo-wiki-tree__topic">
        <div class="ayo-wiki-tree__row">
          <a
            class="ayo-wiki-tree__topic-link"
            :class="{ 'is-active': topicActive(topic) }"
            :href="withBase(topic.url)"
            :title="topic.title"
          >
            <span class="ayo-ellipsis ayo-wiki-tree__name">{{ topic.title }}</span>
            <span class="ayo-wiki-tree__count">{{ topic.notes.length }}</span>
          </a>
          <button
            v-if="topic.notes.length"
            class="ayo-wiki-tree__toggle"
            :class="{ 'is-open': isOpen(topic.slug) }"
            type="button"
            :aria-expanded="isOpen(topic.slug)"
            :aria-label="toggleLabel(topic)"
            @click="toggle(topic.slug)"
          >
            {{ isOpen(topic.slug) ? "▾" : "▸" }}
          </button>
        </div>

        <ul v-if="topic.notes.length && isOpen(topic.slug)" class="ayo-wiki-tree__notes">
          <template v-for="(note, index) in topic.notes" :key="note.url">
            <li v-if="isGroupStart(topic.notes, index)" class="ayo-wiki-tree__group">
              {{ note.group }}
            </li>
            <li>
              <a
                class="ayo-wiki-tree__note"
                :class="{ 'is-active': isActive(note.url) }"
                :href="withBase(note.url)"
                :title="note.title"
                >{{ note.title }}</a
              >
            </li>
          </template>
        </ul>
      </li>
    </ul>
  </AyoCard>
</template>

<style scoped>
.ayo-wiki-tree__empty {
  color: var(--ayo-text-5);
  font-size: 14px;
}

.ayo-wiki-tree {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ayo-wiki-tree__topic + .ayo-wiki-tree__topic {
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px dashed var(--ayo-line);
}

.ayo-wiki-tree__row {
  display: flex;
  align-items: center;
  gap: 2px;
}

.ayo-wiki-tree__topic-link {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 3px 4px;
  color: var(--ayo-text-2);
  font-size: 14px;
  font-weight: bold;
  text-decoration: none;
}

.ayo-wiki-tree__topic-link:hover {
  color: var(--ayo-link-hover);
}

.ayo-wiki-tree__topic-link.is-active {
  color: var(--ayo-primary);
}

.ayo-wiki-tree__name {
  flex: 1;
  min-width: 0;
}

.ayo-wiki-tree__count {
  flex-shrink: 0;
  color: var(--ayo-text-5);
  font-size: 12px;
  font-weight: normal;
}

.ayo-wiki-tree__toggle {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--ayo-text-5);
  font-size: 12px;
  line-height: 1;
  cursor: pointer;
}

.ayo-wiki-tree__toggle:hover,
.ayo-wiki-tree__toggle.is-open {
  color: var(--ayo-primary);
}

.ayo-wiki-tree__notes {
  margin: 2px 0 2px 20px;
  padding: 0;
  border-left: 1px solid var(--ayo-line);
  list-style: none;
}

.ayo-wiki-tree__notes > li {
  padding: 1px 0;
}

/* 分组小标题：只是视觉分层，不可点击、不可折叠。
   选择器带上父级是为了压过上面的 `.ayo-wiki-tree__notes > li`（scoped 权重） */
.ayo-wiki-tree__notes > .ayo-wiki-tree__group {
  margin-top: 6px;
  padding: 2px 4px;
  color: var(--ayo-text-5);
  font-size: 12px;
  font-weight: bold;
}

.ayo-wiki-tree__notes > .ayo-wiki-tree__group:first-child {
  margin-top: 0;
}

/* 条目名近黑，蓝色只给 hover；这样 .is-active（当前所在那篇）才是全树唯一的蓝 */
.ayo-wiki-tree__note {
  display: block;
  overflow: hidden;
  padding: 2px 4px;
  color: var(--ayo-heading);
  font-size: 12px;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-decoration: none;
}

/* 取消「看过变灰」：目录里只有「当前项」是蓝的，其余一律近黑 */
.ayo-wiki-tree__note:visited {
  color: var(--ayo-heading);
}

.ayo-wiki-tree__note:hover {
  color: var(--ayo-link-hover);
}

.ayo-wiki-tree__note.is-active {
  background-color: var(--ayo-bg-soft);
  color: var(--ayo-primary);
  font-weight: bold;
  text-decoration: none;
}
</style>
