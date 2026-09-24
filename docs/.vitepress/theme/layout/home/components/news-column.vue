<script setup lang="ts">
/**
 * 首页中栏：公告焦点 + 最新文章列表（对应参考站 NewsColumn）
 *
 * 焦点条目取公告列表的首条（置顶优先、其次日期倒序）；没有公告时退回最新一篇文章，
 * 两者都没有则整块不渲染。
 */
import { computed } from "vue";
import { withBase } from "vitepress";
import { AyoCard } from "@theme/components/common";
import { dateOnly } from "@theme/utils/format";
import { data as announcements } from "@theme/data/announcements.data";
import type { AnnouncementItem } from "@theme/data/announcements.data";
import { data as posts } from "@theme/data/posts.data";
import type { PostItem } from "@theme/data/posts.data";
import { focusAnnouncement as pickFocusAnnouncement } from "@theme/utils/announcement";
import { postSeries, sortPostsByDate } from "@theme/utils/post";

/** 发布时间倒序（L2 口径）：焦点兜底与最新列表都基于这个顺序 */
const allPosts = computed<PostItem[]>(() => sortPostsByDate(posts as PostItem[]));

/** 焦点公告：置顶优先的第一条（排序口径在 L2） */
const focusAnnouncement = computed<AnnouncementItem | null>(() =>
  pickFocusAnnouncement(announcements as AnnouncementItem[])
);

/** 焦点条目：公告优先，缺公告时用最新文章顶上 */
const focus = computed(() => {
  const item = focusAnnouncement.value;
  if (item) {
    return {
      url: item.url,
      title: item.title,
      date: item.date,
      flag: item.recommended ? "置顶" : "",
      origin: "",
      excerpt: item.excerpt,
    };
  }
  const post = allPosts.value[0];
  if (!post) return null;
  return {
    url: post.url,
    title: post.title,
    date: post.date,
    flag: post.recommended ? "置顶" : "",
    origin: post.origin,
    excerpt: post.excerpt,
  };
});

/** 最新文章列表：8 条（条目式约 88px/条）与右栏热榜栏高度大致齐平 */
const latest = computed<PostItem[]>(() => allPosts.value.slice(0, 8));

/**
 * 列表行 = 文章 + 它所属系列（无系列时为空串）
 *
 * 系列名走 L2 的 postSeries（嵌套与扁平两种 frontmatter 写法都由它认），
 * 这里不在模板里临时解析，也不给「无系列」编一个假分类。
 */
const latestRows = computed(() =>
  latest.value.map((post) => ({ post, series: postSeries(post).name }))
);

/** 列表里的「新」标记：前两条闪一下 */
const newest = computed(() => new Set(latest.value.slice(0, 2).map((post) => post.url)));
</script>

<template>
  <div class="ayo-news">
    <AyoCard
      v-if="focus"
      :title="focusAnnouncement ? '公告' : '焦点'"
      :note="dateOnly(focus.date)"
      :more-href="focusAnnouncement ? '/announcement/' : undefined"
      more-title="查看全部公告"
    >
      <div class="ayo-news__focus-title-row">
        <a class="ayo-news__focus-title" :href="withBase(focus.url)" :title="focus.title">{{
          focus.title
        }}</a>
        <span class="ayo-news__focus-date">[{{ dateOnly(focus.date) }}]</span>
      </div>
      <div v-if="focus.flag || focus.origin" class="ayo-news__focus-meta">
        <span v-if="focus.flag" class="ayo-news__focus-rec">{{ focus.flag }}</span>
        <span v-if="focus.origin">{{ focus.origin }}</span>
      </div>
      <p v-if="focus.excerpt" class="ayo-news__focus-excerpt">{{ focus.excerpt }}</p>
    </AyoCard>

    <AyoCard title="最新文章" more-href="/posts/" more-title="进入文章频道">
      <p v-if="!latest.length" class="ayo-news__empty">
        暂无文章（新增 docs/posts/*.md 后自动收录）
      </p>
      <ul v-else class="ayo-list ayo-news__list">
        <li v-for="row in latestRows" :key="row.post.url" class="ayo-news__item">
          <p class="ayo-news__head">
            <a
              class="ayo-ellipsis ayo-news__link"
              :href="withBase(row.post.url)"
              :title="row.post.title"
              >{{ row.post.title }}</a
            >
            <time class="ayo-news__date" :datetime="dateOnly(row.post.date)">{{
              dateOnly(row.post.date)
            }}</time>
          </p>
          <p
            class="ayo-news__excerpt"
            :class="{ 'is-placeholder': !row.post.excerpt }"
            :title="row.post.excerpt || ''"
          >
            {{ row.post.excerpt || (row.post.hasBody ? "（暂无摘要）" : "（正文本站尚未公开）") }}
          </p>
          <p class="ayo-news__meta">
            <em v-if="newest.has(row.post.url)" class="ayo-marker">新</em>
            <a v-if="row.series" class="ayo-news__series" :href="withBase(row.post.url)">{{
              row.series
            }}</a>
          </p>
        </li>
      </ul>
    </AyoCard>
  </div>
</template>

<style scoped>
.ayo-news {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 条目式列表：条目之间只用一条通栏细线分开，间距交给线本身（gap 归零） */
.ayo-news__list {
  display: flex;
  flex-direction: column;
}

.ayo-news__focus-title-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 8px 0 4px;
}

.ayo-news__focus-title {
  flex: 1;
  min-width: 0;
  color: var(--ayo-heading);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.5;
  text-decoration: none;
}

/* 取消「看过变灰」，并去掉这里硬编码的 #444：标题恒为近黑，状态只由 hover 表达 */
.ayo-news__focus-title:visited {
  color: var(--ayo-heading);
}

.ayo-news__focus-title:hover {
  color: var(--ayo-primary);
}

.ayo-news__focus-date {
  flex-shrink: 0;
  color: var(--ayo-primary);
  font-size: 12px;
  white-space: nowrap;
}

.ayo-news__focus-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ayo-text-3);
  font-size: 12px;
}

/* 「置顶」标记用红：与「新」（蓝）、「荐」（琥珀）拉开，四种标记各一色 */
.ayo-news__focus-rec {
  padding: 0 4px;
  border: 1px solid var(--ayo-red);
  color: var(--ayo-red);
  font-size: 12px;
  line-height: 1.5;
}

.ayo-news__focus-excerpt {
  margin: 8px 0 0;
  padding-top: 8px;
  border-top: 1px dashed var(--ayo-line);
  color: var(--ayo-text-2);
  font-size: 12px;
  line-height: 1.8;
}

/* 无边框条目：整条靠 hover 反馈，不再「每条一张卡 + 卡内一条线」叠出双线。
   左右内边距 11px 与卡片标题行（色块 3 + 间隙 8）对齐，列表和标题栏共用一条左基线。
   纵向 10px → 7px：条目里的内容只有一行标题 + 一行摘要，
   留 20px 上下边距时「空气」占了整条的六成 */
.ayo-news__item {
  position: relative;
  padding: 7px 11px;
  border-bottom: 1px solid var(--ayo-line);
  background-color: transparent;
  transition: background-color var(--ayo-transition);
}

.ayo-news__item:last-child {
  border-bottom: 0;
}

/* hover：浅底 + 左侧蓝竖条。竖条走伪元素，不占布局宽度，避免整列文字左右抽动 */
.ayo-news__item::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 3px;
  background-color: transparent;
  transition: background-color var(--ayo-transition);
}

.ayo-news__item:hover {
  background-color: var(--ayo-bg-soft);
}

.ayo-news__item:hover::before {
  background-color: var(--ayo-primary);
}

.ayo-news__head {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 0;
}

/* 条目标题是这一栏的重心：比卡片正文（12px）大两档、近黑、整行标题本身就是链接 */
.ayo-news__link {
  flex: 1;
  min-width: 0;
  color: var(--ayo-text);
  font-size: 14px;
  font-weight: bold;
  line-height: 1.5;
  text-decoration: none;
}

.ayo-news__link:hover {
  color: var(--ayo-primary);
  text-decoration: none;
}

.ayo-news__excerpt {
  display: -webkit-box;
  /* 摘要区固定一行高（1.6em = 行高 1.6 × 1 行）当占位：
     有摘要的与只有占位文案的条目高度一致，列表才有一行一行的节奏。
     原来是两行（3.4em），但条目里 41px 的摘要区比标题还高、整条被撑到 113px ——
     列表要紧凑，摘要就按列表预览的本分只留一行，长摘要仍可点进正文看 */
  min-height: 1.6em;
  margin: 3px 0 0;
  overflow: hidden;
  color: var(--ayo-text-3);
  font-size: 12px;
  line-height: 1.6;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

/* 占位文案不是内容：退到最浅一档灰 */
.ayo-news__excerpt.is-placeholder {
  color: var(--ayo-text-5);
}

/* 元信息行：新标记 + 系列，**右对齐**到条目右下角。
   日期在标题行右上、这两样在条目右下，元信息就都收在右侧一条竖线上，
   左半边始终只放标题与摘要，视线不会被零碎的标签打断。
   **高度是当占位用的**：两样都没有时这一行也留着（纯留白、不放字），
   所以 min-height 给死；line-height 也写死 1.5 而不继承，
   这样它的高度不会随正文的行高设置漂移 */
.ayo-news__meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  min-height: 1.5em;
  margin: 3px 0 0;
  color: var(--ayo-text-4);
  font-size: 12px;
  line-height: 1.5;
}

/* 元信息行已是 flex 布局，标记自带的右外边距会和 gap 叠加 */
.ayo-news__meta .ayo-marker {
  margin-right: 0;
}

/* 元信息行里的系列名是「标签」不是「条目名」：退到灰、hover 才变蓝
   （口径同文章列表里的标签，见 docs/.vitepress/theme/layout/posts/index.vue 的 .ayo-posts__tag） */
.ayo-news__series {
  color: var(--ayo-text-3);
  text-decoration: none;
}

.ayo-news__series:hover {
  color: var(--ayo-link-hover);
}

.ayo-news__series::before {
  content: "·";
  margin-right: 6px;
  color: var(--ayo-text-5);
}

.ayo-news__series:hover {
  color: var(--ayo-link-hover);
}

.ayo-news__date {
  flex-shrink: 0;
  color: var(--ayo-text-4);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.ayo-news__empty {
  padding: 8px 0;
  color: var(--ayo-text-5);
  font-size: 12px;
}

/* 窄屏：日期让位给标题，否则 14px 标题在一行里只剩十来个字 */
@media (max-width: 720px) {
  .ayo-news__date {
    display: none;
  }
}
</style>
