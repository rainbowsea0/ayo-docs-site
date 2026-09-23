<script setup lang="ts">
/**
 * 通用文档 / 文章详情页（默认页 + frontmatter.layout: post/doc）
 *
 * 版式对齐参考站 DocPage：三栏（左：系列目录 / 推荐阅读，中：正文卡片，右：页内目录）。
 * 其余形态各有自己的布局（内容页只需在 frontmatter 里声明 layout）：
 *   - 知识库（/wiki/**）→ layout/wiki
 *   - 公告（/announcement/<名字>/）→ layout/announcement
 *   - 项目（/projects/<项目>/**）→ layout/project
 *
 * 骨架与卡片分别在 components/doc/doc-shell.vue 与 article-shell.vue，
 * 本文件只做「取数 + 判断该显示哪一种左栏 + 组装」。
 */
import { computed, nextTick } from "vue";
import { useData } from "vitepress";
import AyoArticleShell from "@theme/components/doc/article-shell.vue";
import AyoDocShell from "@theme/components/doc/doc-shell.vue";
import AyoSeriesSideNav from "@theme/components/portal/series-side-nav.vue";
import { useArticleLock } from "@theme/composables/use-article-lock";
import { useCurrentUrl } from "@theme/composables/use-current-url";
import { useLockCut } from "@theme/composables/use-lock-cut";
import {
  adjacentPosts,
  findPostByUrl,
  postSeries,
  postsInSeries,
  seriesIndexOf,
  sortPostsByDate,
} from "@theme/utils/post";
import { data as posts } from "@theme/data/posts.data";
import type { PostItem } from "@theme/data/posts.data";
import AyoSideColumn from "@theme/layout/home/components/side-column.vue";
import AyoSupportCard from "@theme/layout/home/components/support-card.vue";

const { frontmatter } = useData();

/** 当前路径：与加载器 url 同口径（去掉 base），见 useCurrentUrl */
const currentUrl = useCurrentUrl();

/** 发布时间倒序（排序口径来自 L2，布局不再自己维护顺序） */
const allPosts = computed<PostItem[]>(() => sortPostsByDate(posts as PostItem[]));

/** 当前页对应的文章条目（不在文章列表里的页面为 null） */
const currentPost = computed<PostItem | null>(() =>
  findPostByUrl(allPosts.value, currentUrl.value)
);

/**
 * 锁规则需要的三个事实（见 utils/article-lock 的 LockFacts）
 *
 * 规则本身不写在这里：布局只提供事实、拿结论，判定归属 L2 领域层。
 */
const lockFacts = computed(() => ({
  locked: frontmatter.value.locked,
  hasBody: currentPost.value?.hasBody,
  words: currentPost.value?.words,
}));

/**
 * 锁定视图 + 正文截断
 *
 * 布局只提供事实（frontmatter 的 locked、正文是否有内容、字数），结论与副作用都在 composables：
 *   - useArticleLock：要不要锁、解锁状态（含 localStorage 同步）
 *   - useLockCut：按正文总高的比例算出免费预览高度，写到 CSS 变量上
 */
const { lockedView, unlock } = useArticleLock(lockFacts);
const { reapply: reapplyLockCut } = useLockCut(lockedView);

/**
 * 系列章节（同系列文章，按 order 排列；空数组 = 不是系列文章）
 *
 * 系列文章的左栏要显示「系列目录」——这一块参考站叫 SeriesSideNav，之前漏了移植，
 * 结果系列文章页面左栏只有推荐阅读/最近更新，读者看不到自己在这套系列里的位置。
 */
const seriesChapters = computed<PostItem[]>(() =>
  postsInSeries(allPosts.value, postSeries(currentPost.value).name)
);

/** 系列名（非系列文章为空串，article-shell 靠它决定显不显示「系列」标志） */
const seriesName = computed(() =>
  seriesChapters.value.length ? postSeries(currentPost.value).name : ""
);

/**
 * 当前是系列里的第几章（从 1 起；非系列文章为 0）
 *
 * 用「在该系列里的位次」而不是 frontmatter 的 order：源数据里出现过两篇都写 order: 1
 * 的情况，位次至少不会显示成同一个章号。
 */
const seriesIndex = computed(() => seriesIndexOf(seriesChapters.value, currentUrl.value));

/** 上下篇：在「发布时间倒序」的列表里取相邻两篇（相邻判定在 L2） */
const adjacent = computed(() => adjacentPosts(allPosts.value, currentUrl.value));

const prevPost = computed<PostItem | null>(() => adjacent.value.prev);

const nextPost = computed<PostItem | null>(() => adjacent.value.next);

/**
 * 版权卡片（文章作者 / 文章链接 / 版权声明）：默认显示，页面可在 frontmatter 写 copyright: false 关掉
 *
 * 给频道页用（公告频道页正文只有 <AnnouncementList /> 列表组件，不属于个人署名文章）；
 * 公告详情页这种整类都不放的版式由布局直接传 false，不必每页写 frontmatter。
 */
const showCopyright = computed(() => frontmatter.value.copyright !== false);

// 解锁后恢复被隐藏的正文块（等视图更新完再量高度，否则切点算在旧 DOM 上）
const onUnlocked = (): void => {
  unlock();
  nextTick(reapplyLockCut);
};
</script>

<template>
  <AyoDocShell :locked="lockedView">
    <template #side>
      <AyoSeriesSideNav
        v-if="seriesChapters.length"
        :name="seriesName"
        :chapters="seriesChapters"
        :current-url="currentUrl"
      />
      <AyoSideColumn v-else />
      <div class="ayo-doc__support">
        <AyoSupportCard />
      </div>
    </template>

    <AyoArticleShell
      :post="currentPost"
      :locked-view="lockedView"
      :series-name="seriesName"
      :series-index="seriesIndex"
      :show-copyright="showCopyright"
      :prev="prevPost"
      :next="nextPost"
      @unlocked="onUnlocked"
    />
  </AyoDocShell>
</template>
