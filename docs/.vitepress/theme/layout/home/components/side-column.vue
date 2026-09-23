<script setup lang="ts">
/**
 * 右栏：系列文章 + 推荐阅读 + 最近更新（对应参考站 SideColumn）
 *
 * 只负责取三个列表并渲染：聚合、排序、推荐判定都在 L2（utils/post.ts），
 * 这里不写第二套口径。
 *
 * 三个列表都可能为空（当前「推荐阅读」就是空的）：**空列表整张卡不渲染**。
 * 以前会留一张只写「暂无推荐文章」的卡白占 78px，右栏本来就只有 216px 宽，
 * 一张空卡就顶掉一屏里可见的一张真卡。无数据时不做无意义的空态，直接不出现。
 */
import { computed } from "vue";
import { withBase } from "vitepress";
import { AyoCard } from "@theme/components/common";
import { dateOnly, monthDay } from "@theme/utils/format";
import { data as posts } from "@theme/data/posts.data";
import type { PostItem } from "@theme/data/posts.data";
import {
  groupPostsBySeries,
  latestPosts,
  recommendedPosts,
  sortPostsByDate,
} from "@theme/utils/post";

const allPosts = computed<PostItem[]>(() => sortPostsByDate(posts as PostItem[]));

interface SeriesGroup {
  name: string;
  count: number;
  first: PostItem;
}

/** 系列文章：按系列聚合，篇数多的排前面（顺序由 L2 决定） */
const seriesGroups = computed<SeriesGroup[]>(() =>
  groupPostsBySeries(allPosts.value).map((group) => ({
    name: group.name,
    count: group.posts.length,
    first: group.posts[0],
  }))
);

/** 推荐阅读：带推荐标记的文章，按发布时间倒序取前 6 篇 */
const recommend = computed<PostItem[]>(() => recommendedPosts(allPosts.value, 6));

/** 最近更新：按更新时间倒序取前 6 篇 */
const updates = computed<PostItem[]>(() => latestPosts(allPosts.value, 6));
</script>

<template>
  <div class="ayo-hot">
    <AyoCard
      v-if="seriesGroups.length"
      title="系列文章"
      tone="cyan"
      more-href="/series/"
      more-title="进入系列文章页"
    >
      <ul class="ayo-list">
        <li v-for="group in seriesGroups" :key="group.name" class="ayo-hot__row">
          <a
            class="ayo-ellipsis ayo-hot__series"
            :href="withBase(group.first.url)"
            :title="group.name"
            >{{ group.name }}</a
          >
          <span class="ayo-hot__count">{{ group.count }} 篇</span>
        </li>
      </ul>
    </AyoCard>

    <AyoCard
      v-if="recommend.length"
      title="推荐阅读"
      tone="accent"
      more-href="/posts/"
      more-title="进入文章频道"
    >
      <ul class="ayo-list ayo-hot__list">
        <li v-for="post in recommend" :key="post.url" class="ayo-hot__row">
          <em class="ayo-marker ayo-marker--rec">荐</em>
          <a class="ayo-hot__link" :href="withBase(post.url)" :title="post.title">{{
            post.title
          }}</a>
          <span class="ayo-hot__date" :title="dateOnly(post.date)">{{ monthDay(post.date) }}</span>
        </li>
      </ul>
    </AyoCard>

    <AyoCard
      v-if="updates.length"
      title="最近更新"
      tone="green"
      more-href="/posts/"
      more-title="进入文章频道"
    >
      <ul class="ayo-list ayo-hot__list">
        <li v-for="post in updates" :key="post.url" class="ayo-hot__row">
          <!-- 日期收在标题右侧、只留月日：内宽 194px 的栏里，
               日期排在前头会把标题挤到只剩十来个字，整列全是省略号 -->
          <a class="ayo-hot__link" :href="withBase(post.url)" :title="post.title">{{
            post.title
          }}</a>
          <span
            class="ayo-hot__update"
            :title="post.updated ? `完整时间 ${post.updated}` : `发布时间 ${dateOnly(post.date)}`"
            >{{ monthDay(post.updated || post.date) }}</span
          >
        </li>
      </ul>
    </AyoCard>
  </div>
</template>

<style scoped>
.ayo-hot {
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* 卡片正文统一 12px；日期、「N 篇」等次要文字维持 12px 一档，不再单独放大 */
  font-size: 12px;
}

.ayo-hot__row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

/* 列表行（推荐阅读 / 最近更新）：标题允许折两行，靠上对齐，
   这样 194px 内宽也能把标题读完，而不是一行省略号 */
.ayo-hot__list .ayo-hot__row {
  align-items: flex-start;
}

/* 列表里的标题是**内容**不是导航：与中栏条目标题同色（近黑），hover 才转蓝。
   以前用链接蓝，一列六条就是一片蓝墙，右栏和中栏看起来像两个站 */
.ayo-hot__link {
  display: -webkit-box;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--ayo-text);
  line-height: 1.5;
  text-decoration: none;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.ayo-hot__link:hover {
  color: var(--ayo-primary);
}

/* 日期固定一档灰：它是元信息，不是链接；line-height 与标题首行同高（12×1.5=18px），
   折行时日期才不会跟着标题往下滑 */
.ayo-hot__date,
.ayo-hot__count,
.ayo-hot__update {
  flex-shrink: 0;
  color: var(--ayo-text-4);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  line-height: 18px;
}

/* 「N 篇」是系列条目的计数，按卡片正文那一档（12px）走，不跟着日期降到 11px */
.ayo-hot__count {
  font-size: 12px;
  line-height: 1.5;
}

/* 系列名同理：近黑，hover 转蓝 */
.ayo-hot__series {
  flex: 1;
  min-width: 0;
  color: var(--ayo-text);
  text-decoration: none;
}

.ayo-hot__series:hover {
  color: var(--ayo-primary);
}

/* 三个列表都可能为空，且空列表的卡整张不渲染（见模板 v-if），
   所以这里不再需要 .ayo-hot__empty 空态样式 */

/* 单栏时右栏卡片按两列铺开：一列铺满 1000px 的话，
   「站点信息」的标签与数值会分居屏幕两端（实测相距 900px） */
@media (max-width: 1024px) {
  .ayo-hot {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}

@media (max-width: 640px) {
  .ayo-hot {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
