<script setup lang="ts">
/**
 * 公告详情页（frontmatter.layout: announcement）
 *
 * 单栏公文排版（.ayo-doc--announce 由 doc-shell 的 announce 打开，版式见 style/announce.css）：
 * 红头版头 → 发文字号 → 标题 → 正文 → 落款。左栏、页内目录、上下篇都退场，
 * 内容页只需要写 frontmatter（公告惯例：meta: false 隐藏信息行）。
 * 公告代表站点发布，正文之后不放版权卡片（show-copyright="false"）。
 */
import { computed } from "vue";
import { useData } from "vitepress";
import AyoAnnounceRedhead from "@theme/components/announcement/announce-redhead.vue";
import AyoArticleShell from "@theme/components/doc/article-shell.vue";
import AyoDocShell from "@theme/components/doc/doc-shell.vue";
import { useCurrentUrl } from "@theme/composables/use-current-url";
import { announceNo, announcementIndexOf } from "@theme/utils/announcement";
import { data as announcements } from "@theme/data/announcements.data";
import type { AnnouncementItem } from "@theme/data/announcements.data";

const { frontmatter, site } = useData();

/** 当前路径：与加载器 url 同口径（去掉 base），见 useCurrentUrl */
const currentUrl = useCurrentUrl();

/**
 * 发文字号：优先 frontmatter.docNo，缺省按「站名〔年〕序号号」拼，
 * 序号取该公告在公告列表里的位次（排序口径在 L2）。
 */
const docNo = computed(() =>
  announceNo({
    manual: frontmatter.value.docNo,
    date: frontmatter.value.date,
    siteTitle: site.value.title,
    serial: announcementIndexOf(announcements as AnnouncementItem[], currentUrl.value),
  })
);
</script>

<template>
  <AyoDocShell announce>
    <AyoArticleShell :show-copyright="false">
      <template #head>
        <AyoAnnounceRedhead :org="`${site.title}文件`" :no="docNo" />
      </template>
    </AyoArticleShell>
  </AyoDocShell>
</template>
