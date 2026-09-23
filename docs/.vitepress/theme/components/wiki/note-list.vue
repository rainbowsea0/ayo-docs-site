<script setup lang="ts">
/**
 * 单个主题的笔记清单
 *
 * 参考站把这个组件注册成全局组件但内容里没人用（主题页其实没有笔记列表），
 * 本站改为由文档页布局在「/wiki/<主题>/」这类主题页上自动渲染，省掉逐页写标签。
 */
import { computed } from "vue";
import { withBase } from "vitepress";
import { data as topics } from "@theme/data/wiki.data";
import type { WikiNote, WikiTopic } from "@theme/data/wiki.data";

const props = defineProps<{ topicSlug: string }>();

const topic = computed<WikiTopic | undefined>(() =>
  (topics as WikiTopic[]).find((item) => item.slug === props.topicSlug)
);

const notes = computed<WikiNote[]>(() => topic.value?.notes ?? []);

/**
 * 这个位置要不要插一行分组小标题
 *
 * 笔记已按「分组 → order」排好（见 wiki.data.ts 的 byGroupThenOrder），同组是连续块，
 * 所以「分组名与上一条不同」就是组的起点；未写 group 的笔记（整体排在最后）不插标题。
 */
const isGroupStart = (list: WikiNote[], index: number): boolean =>
  Boolean(list[index]?.group) && list[index]?.group !== list[index - 1]?.group;
</script>

<template>
  <div class="ayo-wiki-notes">
    <p v-if="!topic" class="ayo-wiki-notes__empty">
      未找到主题「{{ topicSlug }}」（应在 /wiki/{{ topicSlug }}/index.md 有主题页）。
    </p>
    <p v-else-if="!notes.length" class="ayo-wiki-notes__empty">该主题下暂无笔记。</p>
    <ul v-else class="ayo-wiki-notes__list">
      <template v-for="(note, index) in notes" :key="note.url">
        <li v-if="isGroupStart(notes, index)" class="ayo-wiki-notes__group">
          {{ note.group }}
        </li>
        <li class="ayo-wiki-notes__item">
          <div class="ayo-wiki-notes__row">
            <span class="ayo-wiki-notes__index">{{ String(index + 1).padStart(2, "0") }}</span>
            <a
              class="ayo-ellipsis ayo-wiki-notes__link"
              :href="withBase(note.url)"
              :title="note.title"
              >{{ note.title }}</a
            >
            <span v-if="note.updated" class="ayo-wiki-notes__date">[{{ note.updated }}]</span>
          </div>
          <p v-if="note.summary" class="ayo-wiki-notes__summary">{{ note.summary }}</p>
        </li>
      </template>
    </ul>
  </div>
</template>

<style scoped>
.ayo-wiki-notes {
  margin-top: 24px;
}

.ayo-wiki-notes__empty {
  padding: 20px;
  border: 1px dashed var(--ayo-line);
  background-color: var(--ayo-bg);
  color: var(--ayo-text-4);
  font-size: 13px;
  text-align: center;
}

.ayo-wiki-notes__list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.ayo-wiki-notes__item {
  padding: 10px 12px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
  transition:
    border-color var(--ayo-transition),
    box-shadow var(--ayo-transition);
}

.ayo-wiki-notes__item:hover {
  border-color: var(--ayo-primary-line);
  box-shadow: var(--ayo-shadow);
}

/* 悬停整行就点亮标题：与标签 / 系列清单同一套反馈 */
.ayo-wiki-notes__item:hover .ayo-wiki-notes__link {
  color: var(--ayo-link-hover);
}

.ayo-wiki-notes__row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.ayo-wiki-notes__index {
  flex-shrink: 0;
  color: var(--ayo-text-5);
  font-family: var(--ayo-font-mono);
  font-size: 12px;
}

/* 条目名近黑：蓝色只留给 hover 与「当前项」，否则整屏蓝字像全都处于激活态 */
.ayo-wiki-notes__link {
  flex: 1;
  min-width: 0;
  color: var(--ayo-heading);
}

/* 取消「看过变灰」：本清单里颜色不表示访问状态 */
.ayo-wiki-notes__link:visited {
  color: var(--ayo-heading);
}

.ayo-wiki-notes__date {
  flex-shrink: 0;
  color: var(--ayo-text-5);
  font-size: 12px;
}

.ayo-wiki-notes__summary {
  margin: 4px 0 0;
  color: var(--ayo-text-2);
  font-size: 13px;
  line-height: 1.7;
}

/* 分组小标题：清单是 flex + gap:10px，用负 margin 把标题往它的第一条贴一点，
   免得它看起来像上一组的尾巴。编号仍是全清单连续，不在组内重新开始 */
.ayo-wiki-notes__group {
  margin-bottom: -6px;
  padding: 0 2px;
  color: var(--ayo-text-5);
  font-size: 12px;
  font-weight: bold;
}
</style>
