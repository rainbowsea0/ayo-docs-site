<script setup lang="ts">
/**
 * 项目页（frontmatter.layout: project）：项目落地页 + 各章节页
 *
 * 左栏换成章节导航（项目首页 + 本章节清单），其余与通用文档一致（骨架/卡片复用 doc-shell 与
 * article-shell）。章节顺序与当前项判断都在 utils/project（L2）。
 */
import { computed } from "vue";
import AyoArticleShell from "@theme/components/doc/article-shell.vue";
import AyoDocShell from "@theme/components/doc/doc-shell.vue";
import AyoChapterNav from "@theme/components/project/chapter-nav.vue";
import { useCurrentUrl } from "@theme/composables/use-current-url";
import { projectOf } from "@theme/utils/project";
import { sortPostsByDate } from "@theme/utils/post";
import { data as posts } from "@theme/data/posts.data";
import type { PostItem } from "@theme/data/posts.data";
import { data as projects } from "@theme/data/projects.data";
import type { ProjectItem } from "@theme/data/projects.data";
import AyoSupportCard from "@theme/layout/home/components/support-card.vue";

/** 当前路径：与加载器 url 同口径（去掉 base），见 useCurrentUrl */
const currentUrl = useCurrentUrl();

/** 当前页所属项目（不在任何项目里时为 null，此时左栏只剩关注与支持） */
const currentProject = computed<ProjectItem | null>(() =>
  projectOf(projects as ProjectItem[], currentUrl.value)
);

/**
 * 项目页一般不在文章列表里（项目正文不是文章），所以这里通常为 null；
 * 取一次是为了让字数/阅读时长的构建期兜底也能用上（详情见 use-doc-meta）。
 */
const currentPost = computed<PostItem | null>(
  () => (posts as PostItem[]).find((post) => post.url === currentUrl.value) ?? null
);
</script>

<template>
  <AyoDocShell>
    <template #side>
      <AyoChapterNav v-if="currentProject" :project="currentProject" :current-path="currentUrl" />
      <div class="ayo-doc__support">
        <AyoSupportCard />
      </div>
    </template>

    <AyoArticleShell :post="currentPost" />
  </AyoDocShell>
</template>
