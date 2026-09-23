<script setup lang="ts">
/**
 * 项目章节导航（左栏卡片）
 *
 * 纯展示：当前项判断在 utils/project（L2），这里只把「项目首页 + 各章节」画出来。
 */
import { computed } from "vue";
import { withBase } from "vitepress";
import { AyoCard } from "@theme/components/common";
import type { ProjectItem } from "@theme/data/projects.data";
import { isCurrentProjectLink, sortProjectChapters } from "@theme/utils/project";

const props = defineProps<{
  /** 当前页所属项目 */
  project: ProjectItem;
  /** 当前页路径，用于高亮当前章节 */
  currentPath: string;
}>();

/** 章节顺序由 L2 决定（加载器只给原始顺序） */
const chapters = computed(() => sortProjectChapters(props.project.chapters));

const isActive = (link: string): boolean => isCurrentProjectLink(link, props.currentPath);
</script>

<template>
  <AyoCard title="章节导航">
    <ul class="ayo-list">
      <li>
        <a
          class="ayo-ellipsis ayo-doc__side-link"
          :class="{ 'is-active': isActive(project.home) }"
          :href="withBase(project.home)"
          >项目首页</a
        >
      </li>
      <li v-for="chapter in chapters" :key="chapter.link">
        <a
          class="ayo-ellipsis ayo-doc__side-link"
          :class="{ 'is-active': isActive(chapter.link) }"
          :href="withBase(chapter.link)"
          :title="chapter.title"
          >{{ chapter.title }}</a
        >
      </li>
    </ul>
  </AyoCard>
</template>
