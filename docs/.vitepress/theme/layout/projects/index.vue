<script setup lang="ts">
/**
 * 项目频道页（frontmatter.layout: projects）
 *
 * 版式对齐参考站 ProjectsLayout：一张「项目频道」卡片列出全部项目
 * （项目名 + 立项日期 + 简介 + 状态徽章），点击进入项目落地页。
 * 项目与章节由构建期 projects 加载器按目录结构自动聚合。
 */
import { withBase } from "vitepress";
import { AyoBadge, AyoCard } from "@theme/components/common";
import { data as projects } from "@theme/data/projects.data";
import type { ProjectItem } from "@theme/data/projects.data";

const list = projects as ProjectItem[];
</script>

<template>
  <div class="ayo-projects">
    <AyoCard title="📦 项目频道" :note="`共 ${list.length} 个项目 · 点击进入项目主页`" pad="wide">
      <p v-if="!list.length" class="ayo-projects__empty">
        暂无项目（新增 projects/&lt;名字&gt;/index.md 即会自动出现）。
      </p>
      <ul v-else class="ayo-projects__list">
        <li v-for="project in list" :key="project.home" class="ayo-projects__item">
          <div class="ayo-projects__row">
            <span class="ayo-projects__dot">·</span>
            <a
              class="ayo-ellipsis ayo-projects__link"
              :href="withBase(project.home)"
              :title="project.name"
            >
              {{ project.name }}
            </a>
            <span v-if="project.date" class="ayo-projects__date">[{{ project.date }}]</span>
          </div>
          <div class="ayo-projects__row ayo-projects__row--sub">
            <span class="ayo-projects__desc">{{ project.desc }}</span>
            <AyoBadge :status="project.status" />
            <span v-if="project.chapters.length" class="ayo-projects__chapters">
              {{ project.chapters.length }} 章
            </span>
          </div>
        </li>
      </ul>
    </AyoCard>
  </div>
</template>

<style scoped>
.ayo-projects {
  max-width: var(--ayo-page-width);
  margin: 0 auto;
  padding: 24px 24px 56px;
}

.ayo-projects__empty {
  padding: 20px;
  color: var(--ayo-text-4);
  font-size: 13px;
  text-align: center;
}

.ayo-projects__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ayo-projects__item {
  padding: 5px 0;
  border-bottom: 1px dotted var(--ayo-line);
}

.ayo-projects__item:last-child {
  border-bottom: none;
}

.ayo-projects__row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.ayo-projects__row--sub {
  margin-top: 2px;
}

.ayo-projects__dot {
  flex-shrink: 0;
  color: var(--ayo-text-5);
}

.ayo-projects__link {
  flex: 1;
  min-width: 0;
  color: var(--ayo-heading);
}

/* 取消「看过变灰」：本清单只有 hover 一个状态（链接口径见 style/var.css） */
.ayo-projects__link:visited {
  color: var(--ayo-heading);
}

.ayo-projects__link:hover {
  color: var(--ayo-link-hover);
}

.ayo-projects__date {
  flex-shrink: 0;
  color: var(--ayo-text-5);
  font-size: 13px;
}

.ayo-projects__desc {
  flex: 1;
  min-width: 0;
  color: var(--ayo-text-2);
  font-size: 13px;
  line-height: 1.7;
}

.ayo-projects__chapters {
  flex-shrink: 0;
  color: var(--ayo-text-5);
  font-size: 12px;
}

@media (max-width: 720px) {
  .ayo-projects {
    padding: 16px 12px 40px;
  }

  .ayo-projects__desc {
    display: none;
  }
}
</style>
