<script setup lang="ts">
/**
 * 知识库页（frontmatter.layout: wiki）
 *
 * 三态共用一套骨架，靠路径判定（内容页不用写额外标签）：
 *   - 知识库主页（/wiki）：左栏目录树；
 *   - 主题页（/wiki/<主题>/）：树 + 正文下方自动列出该主题的笔记；
 *   - 笔记页（/wiki/<主题>/<笔记>）：树 + 正文下方追加整理说明。
 *
 * 以前这些分支和「通用文档」挤在同一个 doc 布局里，6 种形态的判定互相干扰；
 * 现在骨架（doc-shell）与卡片（article-shell）都复用，这里只写知识库自己的三态。
 * 知识库整类不放版权卡片（show-copyright="false"），笔记页的「整理说明」是另一块（AyoWikiAuthor）。
 */
import { computed } from "vue";
import { useCurrentUrl } from "@theme/composables/use-current-url";
import AyoArticleShell from "@theme/components/doc/article-shell.vue";
import AyoDocShell from "@theme/components/doc/doc-shell.vue";
import { AyoWikiAuthor, AyoWikiNoteList, AyoWikiTree } from "@theme/components/wiki";
import { findPostByUrl, sortPostsByDate } from "@theme/utils/post";
import { normalizeUrl } from "@theme/utils/format";
import { data as posts } from "@theme/data/posts.data";
import type { PostItem } from "@theme/data/posts.data";
import AyoSupportCard from "@theme/layout/home/components/support-card.vue";

/** 当前路径：与加载器 url 同口径（去掉 base），见 useCurrentUrl */
const currentUrl = useCurrentUrl();

/** 当前路径：统一成「无 .html、无 /index、无尾斜杠」再判断，兼容目录页 URL */
const pagePath = computed(() =>
  normalizeUrl(currentUrl.value)
    .replace(/\/index$/, "")
    .replace(/\/$/, "")
);

/** 知识库主页本身 */
const isHub = computed(() => pagePath.value === "/wiki");

/** 主题页（/wiki/<主题>/）：正文下方列出该主题的笔记 */
const topicSlug = computed(() => /^\/wiki\/([^/]+)$/.exec(pagePath.value)?.[1] ?? "");

/** 笔记页：正文下方显示整理说明 */
const isNote = computed(() => !isHub.value && topicSlug.value === "");

/**
 * 笔记页的元信息（字数、阅读时长的构建期兜底）取自文章列表：知识库笔记不在里面，
 * 所以这里多半是 null，字数由 useDocMeta 的 DOM 统计补上。
 */
const currentPost = computed<PostItem | null>(() =>
  findPostByUrl(sortPostsByDate(posts as PostItem[]), currentUrl.value)
);
</script>

<template>
  <AyoDocShell>
    <template #side>
      <AyoWikiTree />
      <div class="ayo-doc__support">
        <AyoSupportCard />
      </div>
    </template>

    <!-- 主页只放主题卡聚合，没有可编辑正文，不给「编辑此页」入口；主题页 / 笔记页照常。
         信息行只给笔记页（有 frontmatter.date 的那种），hub 与主题页不是文章，不摆日期与阅读时长 -->
    <AyoArticleShell
      :post="currentPost"
      :show-copyright="false"
      :show-edit-link="!isHub"
      :show-meta="isNote"
    >
      <template #after>
        <AyoWikiNoteList v-if="topicSlug" :topic-slug="topicSlug" />
        <AyoWikiAuthor v-if="isNote" />
      </template>
    </AyoArticleShell>
  </AyoDocShell>
</template>
