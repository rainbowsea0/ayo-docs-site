<script setup lang="ts">
/**
 * 文章频道列表页（frontmatter.layout: posts）
 *
 * 版式对齐参考站文章频道：工具条（只看推荐 / 按最近更新 / 只看系列 / 标题查询）+ 按年份分组 + 分页
 * 说明：内容未迁移，本站暂时没有 docs/posts/index.md，本布局建好后即可启用。
 */
import { computed, ref } from "vue";
import { withBase } from "vitepress";
import { AyoButton, AyoCard, AyoInput, AyoPagination } from "@theme/components/common";
import { useListView } from "@theme/composables/use-list-view";
import { dateOnly, tagSlug } from "@theme/utils/format";
import { data as posts } from "@theme/data/posts.data";
import type { PostItem } from "@theme/data/posts.data";
import {
  isSeriesPost,
  recommendedPosts,
  sortPostsByDate,
  sortPostsByUpdated,
} from "@theme/utils/post";

const PAGE_SIZE = 50;

/** 加载器只给原始顺序：按发布时间倒序是列表页的口径，排序实现只有 L2 一份 */
const allPosts = computed<PostItem[]>(() => sortPostsByDate(posts as PostItem[]));

/**
 * 列表筛选：只看推荐 / 只看系列是互斥的，所以是一组单选而不是两个复选框。
 * 单选组必须有第三项「全部」才能表达「不过滤」—— 否则默认就得强制选中某一类。
 */
type ListFilter = "all" | "recommended" | "series";

const listFilter = ref<ListFilter>("all");
const sortByUpdated = ref(false);

/** 工具条筛选 + 排序（搜索与分页交给 useListView） */
const baseList = computed<PostItem[]>(() => {
  let list = allPosts.value;
  if (listFilter.value === "recommended") list = recommendedPosts(list);
  if (listFilter.value === "series") list = list.filter(isSeriesPost);
  return sortByUpdated.value ? sortPostsByUpdated(list) : list;
});

const {
  keyword,
  page: currentPage,
  filtered: sorted,
  pageItems: pagePosts,
} = useListView(baseList, {
  searchText: (post) => post.title,
  pageSize: PAGE_SIZE,
  resetOn: () => `${listFilter.value}|${sortByUpdated.value}`,
});

/**
 * 当前排序依据对应的那个日期
 *
 * 勾选「按最近更新」后，年份分组与行内日期都跟着切到更新时间 ——
 * 否则会出现「2026 年」那一组里排着 2025 年创建的文章这种自相矛盾的观感。
 * updated 为空（文件还没提交过）时回退创建日期。
 */
const activeDate = (post: PostItem): string =>
  sortByUpdated.value ? post.updated || post.date : post.date;

/** 行内日期的悬停说明：讲清这一列在当前排序下是哪个日期 */
const dateTitle = (post: PostItem): string =>
  sortByUpdated.value
    ? `最近更新 ${dateOnly(post.updated || post.date)}`
    : `创建于 ${dateOnly(post.date)}`;

/** 按年份分组（当前页内）：年份取当前排序依据的那一年 */
const years = computed<{ year: string; posts: PostItem[] }[]>(() => {
  const map = new Map<string, PostItem[]>();
  for (const post of pagePosts.value) {
    const year = activeDate(post).slice(0, 4) || "未知";
    const list = map.get(year) ?? [];
    list.push(post);
    map.set(year, list);
  }
  return [...map.entries()]
    .map(([year, list]) => ({ year, posts: list }))
    .sort((a, b) => (a.year < b.year ? 1 : -1));
});

const listNote = computed(
  () =>
    `共 ${allPosts.value.length} 篇 · ${sortByUpdated.value ? "按最近更新倒序" : "按创建时间倒序"}` +
    (sorted.value.length !== allPosts.value.length ? ` · 匹配 ${sorted.value.length} 篇` : "")
);

/** 前两条给「新」标记 */
const newest = computed(() => new Set(allPosts.value.slice(0, 2).map((post) => post.url)));
</script>

<template>
  <div class="ayo-posts">
    <AyoCard title="📰 文章频道" :note="listNote" pad="wide">
      <div class="ayo-posts__toolbar">
        <label class="ayo-posts__check" title="不做筛选，按年份列出全部文章">
          <input v-model="listFilter" type="radio" name="posts-filter" value="all" />全部
        </label>
        <label class="ayo-posts__check" title="只显示带推荐标记的文章（frontmatter.recommended）">
          <input
            v-model="listFilter"
            type="radio"
            name="posts-filter"
            value="recommended"
          />只看推荐
        </label>
        <label
          class="ayo-posts__check"
          title="只显示归入系列的文章（frontmatter.series.order > 0）"
        >
          <input v-model="listFilter" type="radio" name="posts-filter" value="series" />只看系列
        </label>
        <label class="ayo-posts__check ayo-posts__sort" title="按最近更新时间（git 提交时间）倒序">
          <input v-model="sortByUpdated" type="checkbox" />按最近更新
        </label>
        <AyoInput v-model="keyword" placeholder="标题查询…" class="ayo-posts__search" />
      </div>

      <p v-if="!sorted.length" class="ayo-posts__empty">暂无推荐文章</p>

      <div v-for="group in years" :key="group.year" class="ayo-posts__year">
        <div class="ayo-posts__year-head">
          <span class="ayo-posts__year-title">{{ group.year }} 年</span>
          <span class="ayo-posts__year-count">（{{ group.posts.length }} 篇）</span>
        </div>

        <ul class="ayo-list ayo-posts__list">
          <li v-for="post in group.posts" :key="post.url" class="ayo-posts__item">
            <p class="ayo-posts__head">
              <a
                class="ayo-ellipsis ayo-posts__link"
                :href="withBase(post.url)"
                :title="post.title"
                >{{ post.title }}</a
              >
            </p>
            <p v-if="post.excerpt" class="ayo-posts__excerpt">{{ post.excerpt }}</p>
            <p class="ayo-posts__foot">
              <span class="ayo-posts__meta">
                <em v-if="newest.has(post.url)" class="ayo-marker">新</em>
                <span class="ayo-posts__date" :title="dateTitle(post)">{{
                  dateOnly(activeDate(post))
                }}</span>
                <span v-if="post.tags.length" class="ayo-posts__tags">
                  <a
                    v-for="tag in post.tags.slice(0, 3)"
                    :key="tag"
                    class="ayo-posts__tag"
                    :href="withBase(`/tags/#${tagSlug(tag)}`)"
                    :title="tag"
                    >#{{ tag }}</a
                  >
                  <span v-if="post.tags.length > 3" class="ayo-posts__tag ayo-posts__tag--more"
                    >…</span
                  >
                </span>
              </span>
              <AyoButton
                class="ayo-posts__read"
                variant="primary"
                size="xs"
                :href="withBase(post.url)"
                :aria-label="`阅读全文：${post.title}`"
                >阅读全文</AyoButton
              >
            </p>
          </li>
        </ul>
      </div>

      <AyoPagination v-model:current="currentPage" :total="sorted.length" :page-size="PAGE_SIZE" />
    </AyoCard>
  </div>
</template>

<style scoped>
.ayo-posts {
  max-width: var(--ayo-page-width);
  margin: 0 auto;
  padding: 24px 24px 56px;
}

.ayo-posts__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 14px;
  padding: 7px 0;
  border-bottom: 1px dashed var(--ayo-line);
  font-size: 13px;
}

.ayo-posts__check {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--ayo-text-2);
  white-space: nowrap;
  cursor: pointer;
  user-select: none;
}

.ayo-posts__check input {
  margin: 0;
  accent-color: var(--ayo-primary);
}

/* 「按最近更新」是排序开关，不是筛选：与前面的三选一用一条细竖线分开，
   否则一排圆点与方框混在一起，容易被看成一回事 */
.ayo-posts__sort {
  padding-left: 14px;
  border-left: 1px solid var(--ayo-line);
}

/* 查询框靠右：与左侧三个复选框分居两端，右边缘对齐下方文章列表的右边缘。
   margin-left: auto 在 flex 行里会吃掉所有剩余空间，把它推到行尾（gap 仍是最小间隔）；
   窄屏折行时它独占一行，auto 依然把它顶到右边，对齐关系不变 */
.ayo-posts__search {
  width: 180px;
  max-width: 40%;
  margin-left: auto;
}

.ayo-posts__year {
  margin-top: 12px;
}

.ayo-posts__year-head {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 4px;
}

.ayo-posts__year-title {
  color: var(--ayo-blue);
  font-size: 15px;
  font-weight: bold;
}

.ayo-posts__year-count {
  color: var(--ayo-text-4);
  font-size: 13px;
}

/* 卡片列表：条目之间用固定间距分开，不再用点线分隔 */
.ayo-posts__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 每条一张轻卡片：细线 + 白底、不带阴影（阴影只留给外层卡），hover 边框转浅蓝 */
.ayo-posts__item {
  padding: 10px 12px;
  border: 1px solid var(--ayo-line);
  background-color: var(--ayo-bg);
  transition: border-color var(--ayo-transition);
}

.ayo-posts__item:hover {
  border-color: var(--ayo-primary-line);
  background-color: var(--ayo-bg);
}

.ayo-posts__head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
}

/* 标题是卡片里唯一的重心：加粗、提一档字号、近黑；摘要、日期、标签都退到它后面 */
.ayo-posts__link {
  flex: 1;
  min-width: 0;
  color: var(--ayo-heading);
  font-size: 14px;
  font-weight: bold;
  line-height: 1.45;
}

.ayo-posts__link:hover {
  color: var(--ayo-primary);
  text-decoration: none;
}

.ayo-posts__excerpt {
  display: -webkit-box;
  margin: 4px 0 0;
  overflow: hidden;
  color: var(--ayo-text-2);
  font-size: 12px;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

/* 底行：元信息在左、操作在右，用细线把「内容区」和「操作区」分开 */
.ayo-posts__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 6px 0 0;
  padding-top: 6px;
  border-top: 1px solid var(--ayo-line);
}

.ayo-posts__meta {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 12px;
  min-width: 0;
}

.ayo-posts__read {
  flex-shrink: 0;
}

.ayo-posts__tags {
  flex-shrink: 1;
  display: flex;
  gap: 6px;
  min-width: 0;
  max-width: 60%;
  overflow: hidden;
}

/* 标签是元信息，不能和标题抢蓝色 */
.ayo-posts__tag {
  flex-shrink: 0;
  color: var(--ayo-text-3);
  font-size: 11px;
  line-height: 1.6;
  white-space: nowrap;
  text-decoration: none;
}

.ayo-posts__tag:hover {
  color: var(--ayo-primary);
}

.ayo-posts__tag--more {
  color: var(--ayo-text-5);
}

.ayo-posts__date {
  flex-shrink: 0;
  color: var(--ayo-text-4);
  font-size: 11px;
}

/* 底行已是 flex 布局，标记自带的右外边距会和 gap 叠加 */
.ayo-posts__meta .ayo-marker {
  margin-right: 0;
}

.ayo-posts__empty {
  padding: 24px 0;
  color: var(--ayo-text-4);
  font-size: 13px;
  text-align: center;
}

@media (max-width: 720px) {
  .ayo-posts {
    padding: 16px 12px 40px;
  }

  .ayo-posts__tags {
    display: none;
  }
}
</style>
