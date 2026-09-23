<script setup lang="ts">
/**
 * 文档族正文卡片（doc / wiki / announcement / project 共用）
 *
 * 卡片里的一切都在这里：标题行（系列标志 / 转载标志）、信息行、锁定占位、正文 + 解锁墙、
 * 标签、版权、编辑行、上下篇。四种版式的差异靠插槽：
 *   - #head：卡片最上方的额外内容（公告的红头）
 *   - #after：正文之后、标签之前的额外内容（知识库主题页的笔记列表、笔记页的整理说明）
 *
 * 取数与状态留在布局里（谁在系列里、上下一篇是谁、要不要解锁），本组件只渲染。
 */
import { computed } from "vue";
import { Content, withBase } from "vitepress";
import type { PostItem } from "@theme/data/posts.data";
import { AyoArticleLockWall, AyoCopyright } from "@theme/components/portal";
import { AyoGiscusComment } from "@theme/components/common";
import { useDocMeta } from "@theme/composables/use-doc-meta";
import { dateOnly, tagSlug } from "@theme/utils/format";

const props = withDefaults(
  defineProps<{
    /** 当前页对应的文章条目（知识库笔记、公告这类不在文章列表里的页面为 null） */
    post?: PostItem | null;
    /** 正文处于锁定截断状态：套上 max-height 并显示解锁墙 */
    lockedView?: boolean;
    /** 系列名（非系列文章为空串，此时不显示「系列」标志） */
    seriesName?: string;
    /** 系列内位次（从 1 起） */
    seriesIndex?: number;
    /** 版权块（文章作者 / 文章链接 / 版权声明）是否出现，公告这类不署名的版式传 false */
    showCopyright?: boolean;
    /** 「编辑此页」入口是否出现 */
    showEditLink?: boolean;
    /**
     * 标题下的信息行（日期 / 字数 / 阅读时长）是否出现
     *
     * 更新日期改成取 git 时间后这一行几乎总有内容，非文章性页面（知识库 hub 与主题页）要靠
     * 布局显式关掉；作者还可以用 frontmatter.meta: false 单独关。
     */
    showMeta?: boolean;
    comment?: boolean;
    prev?: PostItem | null;
    next?: PostItem | null;
  }>(),
  {
    post: null,
    lockedView: false,
    seriesName: "",
    seriesIndex: 0,
    showCopyright: true,
    showEditLink: true,
    showMeta: true,
    prev: null,
    next: null,
    comment: true,
  }
);

const emit = defineEmits<{ unlocked: [] }>();

const {
  title,
  created,
  updated,
  origin,
  articleType,
  hideMeta,
  tags,
  wordCount,
  readingMinutes,
  editLink,
  editText,
  lastUpdated,
} = useDocMeta(computed(() => props.post));

/** 只有文章（在文章列表里）才摆上下篇：知识库/公告页没有邻居，不必显示「没有了」 */
const showNav = computed(() => props.post !== null || Boolean(props.prev || props.next));
</script>

<template>
  <article class="ayo-doc__card">
    <slot name="head" />

    <div v-if="title" class="ayo-doc__title-row">
      <h1 class="ayo-doc__title">{{ title }}</h1>
      <span
        v-if="seriesName"
        class="ayo-doc__series-tag"
        :title="`${seriesName} · 第 ${seriesIndex} 章`"
        >系列</span
      >
      <span v-if="origin === '转载'" class="ayo-doc__flag">转载</span>
    </div>

    <div v-if="showMeta && !hideMeta && (created || updated || articleType)" class="ayo-doc__meta">
      <span v-if="created" class="ayo-doc__meta-item" :title="`完整时间 ${created}`">
        📅 创建日期 {{ dateOnly(created) }}
      </span>
      <!-- 比较到「日」：git 更新时间带时分秒，同一天创建并更新不该重复显示两个日期 -->
      <span v-if="updated && dateOnly(updated) !== dateOnly(created)" class="ayo-doc__meta-item">
        🔄 更新日期 {{ dateOnly(updated) }}
      </span>
      <span v-if="articleType" class="ayo-doc__meta-item">📑 {{ articleType }}</span>
      <span class="ayo-doc__meta-item">📝 {{ wordCount }} 字</span>
      <span class="ayo-doc__meta-item">⏱️ 约 {{ readingMinutes }} 分钟</span>
      <span v-if="origin" class="ayo-doc__meta-item ayo-doc__meta-item--end">🖊️ {{ origin }}</span>
    </div>

    <div class="ayo-doc__lock-wrap" :class="{ 'is-locked': lockedView }">
      <div class="vp-doc ayo-doc__content">
        <Content />
      </div>
      <AyoArticleLockWall v-if="lockedView" @unlocked="emit('unlocked')" />
    </div>

    <slot name="after" />

    <div v-if="tags.length" class="ayo-doc__tags">
      <span class="ayo-doc__tags-label">标签</span>
      <a
        v-for="tag in tags"
        :key="tag"
        class="ayo-doc__tag"
        :href="withBase(`/tags/#${tagSlug(tag)}`)"
        >#{{ tag }}</a
      >
    </div>

    <AyoCopyright v-if="showCopyright" />

    <div v-if="lastUpdated || (editLink && showEditLink)" class="ayo-doc__edit">
      <span v-if="lastUpdated" class="ayo-doc__updated">上次更新于 {{ lastUpdated }}</span>
      <a
        v-if="editLink && showEditLink"
        class="ayo-doc__edit-link"
        :href="editLink"
        target="_blank"
        rel="noopener noreferrer"
        >{{ editText }}</a
      >
    </div>

    <nav v-if="showNav" class="ayo-doc__nav">
      <a v-if="prev" class="ayo-doc__nav-link" :href="withBase(prev.url)"
        >上一篇：{{ prev.title }}</a
      >
      <span v-else class="ayo-doc__nav-none">上一篇：没有了</span>
      <a v-if="next" class="ayo-doc__nav-link" :href="withBase(next.url)"
        >下一篇：{{ next.title }}</a
      >
      <span v-else class="ayo-doc__nav-none">下一篇：没有了</span>
    </nav>
  </article>
  <ayo-giscus-comment v-if="comment" />
</template>
